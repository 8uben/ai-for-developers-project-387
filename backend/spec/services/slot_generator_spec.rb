require 'rails_helper'

RSpec.describe SlotGenerator, type: :service do
  describe '#call' do
    let(:event_type) { create(:event_type, id: 'meeting-30', duration_minutes: 30) }
    let(:now) { Time.utc(2026, 6, 1, 8, 0, 0) }

    before do
      allow(Time).to receive(:current).and_return(now)
    end

    it 'generates slots within 14-day window' do
      slots = SlotGenerator.new(event_type, now: now).call
      expect(slots.size).to be > 0

      first_slot_time = Time.parse(slots.first[:start])
      last_slot_time = Time.parse(slots.last[:start])

      expect(first_slot_time).to be >= now
      expect(last_slot_time).to be <= now + 14.days
    end

    it 'generates slots during working hours only (09:00-17:00 UTC)' do
      slots = SlotGenerator.new(event_type, now: now).call

      slots.each do |slot|
        slot_time = Time.parse(slot[:start])
        expect(slot_time.hour).to be >= 9
        expect(slot_time.hour).to be < 17
      end
    end

    it 'generates slots during working hours in specified timezone' do
      # Europe/Moscow is UTC+3, so 09:00-17:00 MSK = 06:00-14:00 UTC
      slots = SlotGenerator.new(event_type, now: now, timezone: "Europe/Moscow").call

      slots.each do |slot|
        slot_time = Time.parse(slot[:start])
        # In UTC, working hours for Moscow are 06:00-14:00
        expect(slot_time.hour).to be >= 6
        expect(slot_time.hour).to be < 14
      end
    end

    it 'falls back to UTC for invalid timezone' do
      slots = SlotGenerator.new(event_type, now: now, timezone: "Invalid/Zone").call

      slots.each do |slot|
        slot_time = Time.parse(slot[:start])
        expect(slot_time.hour).to be >= 9
        expect(slot_time.hour).to be < 17
      end
    end

    it 'marks slots as unavailable when booked' do
      slot_time = now + 1.day + 2.hours + 30.minutes
      Booking.insert_all([ {
        id: SecureRandom.uuid,
        event_type_id: event_type.id,
        start: slot_time,
        "end" => slot_time + 30.minutes,
        guest_name: 'John',
        guest_email: 'john@example.com',
        created_at: now,
        updated_at: now
      } ])

      slots = SlotGenerator.new(event_type, now: now).call
      booked_slot = slots.find { |s| Time.parse(s[:start]) == slot_time }

      expect(booked_slot[:available]).to be false
    end

    it 'marks other slots as available' do
      slot_time = now + 1.day + 2.hours + 30.minutes
      Booking.insert_all([ {
        id: SecureRandom.uuid,
        event_type_id: event_type.id,
        start: slot_time,
        "end" => slot_time + 30.minutes,
        guest_name: 'John',
        guest_email: 'john@example.com',
        created_at: now,
        updated_at: now
      } ])

      slots = SlotGenerator.new(event_type, now: now).call
      other_slot = slots.find { |s| Time.parse(s[:start]) != slot_time }

      expect(other_slot[:available]).to be true
    end
  end
end
