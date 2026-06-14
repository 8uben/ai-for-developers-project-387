require 'rails_helper'

RSpec.describe Booking, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      event_type = create(:event_type, id: 'meeting-30', duration_minutes: 30)
      start_time = Time.current.utc.beginning_of_hour + 10.hours
      booking = build(:booking, event_type: event_type, start: start_time)
      expect(booking).to be_valid
    end

    it 'is not valid without start' do
      event_type = create(:event_type)
      booking = build(:booking, event_type: event_type, start: nil)
      expect(booking).not_to be_valid
    end

    it 'is not valid without guest_name' do
      event_type = create(:event_type)
      booking = build(:booking, event_type: event_type, guest_name: nil)
      expect(booking).not_to be_valid
    end

    it 'is not valid with invalid email' do
      event_type = create(:event_type)
      booking = build(:booking, event_type: event_type, guest_email: 'invalid-email')
      expect(booking).not_to be_valid
    end

    it 'is not valid when slot is outside 14-day window' do
      event_type = create(:event_type, duration_minutes: 30)
      booking = build(:booking, event_type: event_type, start: Time.current.utc + 15.days + 10.hours)
      expect(booking).not_to be_valid
      expect(booking.errors[:start]).to include(/outside/)
    end

    it 'is not valid when slot does not align with grid' do
      event_type = create(:event_type, duration_minutes: 30)
      booking = build(:booking, event_type: event_type, start: Time.current.utc + 1.day + 10.hours + 15.minutes)
      expect(booking).not_to be_valid
      expect(booking.errors[:start]).to include(/align/)
    end

    it 'is not valid when slot is already taken' do
      event_type = create(:event_type, duration_minutes: 30)
      slot_time = Time.current.utc.beginning_of_hour + 1.day + 10.hours

      Booking.insert_all([ {
        id: SecureRandom.uuid,
        event_type_id: event_type.id,
        start: slot_time,
        "end" => slot_time + 30.minutes,
        guest_name: 'Jane',
        guest_email: 'jane@example.com',
        created_at: Time.current,
        updated_at: Time.current
      } ])

      conflicting = build(:booking, event_type: event_type, start: slot_time)
      expect(conflicting).not_to be_valid
      expect(conflicting.errors[:start]).to include(/already booked/)
    end
  end

  describe 'callbacks' do
    it 'calculates end time based on event type duration' do
      event_type = create(:event_type, duration_minutes: 30)
      now = Time.current.utc
      start_time = now.beginning_of_hour + 1.day + 9.hours
      booking = create(:booking, event_type: event_type, start: start_time)
      expect(booking.end).to eq(start_time + 30.minutes)
    end
  end
end
