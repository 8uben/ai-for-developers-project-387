require 'rails_helper'

RSpec.describe 'Public::Bookings', type: :request do
  describe 'POST /public/event-types/:event_type_id/bookings' do
    let(:event_type) { create(:event_type, id: 'meeting-30', duration_minutes: 30) }

    it 'creates a booking with valid data' do
      now = Time.current.utc
      start_time = (now.beginning_of_hour + 1.day + 10.hours).iso8601

      post "/public/event-types/#{event_type.id}/bookings", params: {
        start: start_time,
        guestName: 'John Doe',
        guestEmail: 'john@example.com'
      }, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['guestName']).to eq('John Doe')
      expect(json['eventTypeId']).to eq('meeting-30')
    end

    it 'returns 404 for non-existent event type' do
      now = Time.current.utc
      post '/public/event-types/non-existent/bookings', params: {
        start: (now.beginning_of_hour + 1.day + 10.hours).iso8601,
        guestName: 'John',
        guestEmail: 'john@example.com'
      }, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it 'returns 409 when slot is already taken' do
      now = Time.current.utc
      slot_time = now.beginning_of_hour + 1.day + 10.hours
      Booking.insert_all([ {
        id: SecureRandom.uuid,
        event_type_id: event_type.id,
        start: slot_time,
        "end" => slot_time + 30.minutes,
        guest_name: 'Jane',
        guest_email: 'jane@example.com',
        created_at: now,
        updated_at: now
      } ])

      post "/public/event-types/#{event_type.id}/bookings", params: {
        start: slot_time.iso8601,
        guestName: 'John',
        guestEmail: 'john@example.com'
      }, as: :json

      expect(response).to have_http_status(:conflict)
      json = JSON.parse(response.body)
      expect(json['code']).to eq('slot_taken')
    end

    it 'returns 400 when slot is outside booking window' do
      now = Time.current.utc
      future_time = (now + 20.days).iso8601

      post "/public/event-types/#{event_type.id}/bookings", params: {
        start: future_time,
        guestName: 'John',
        guestEmail: 'john@example.com'
      }, as: :json

      expect(response).to have_http_status(:bad_request)
      json = JSON.parse(response.body)
      expect(json['code']).to eq('out_of_window')
    end
  end
end
