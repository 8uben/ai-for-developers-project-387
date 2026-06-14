require 'rails_helper'

RSpec.describe 'Admin::Bookings', type: :request do
  describe 'GET /admin/bookings' do
    it 'returns bookings sorted by start time' do
      event_type = create(:event_type, id: 'meeting-30')
      earlier = Time.current.utc + 1.day + 10.hours
      later = Time.current.utc + 2.days + 10.hours

      Booking.insert_all([
        { id: SecureRandom.uuid, event_type_id: event_type.id, start: later, "end" => later + 30.minutes, guest_name: 'Later', guest_email: 'later@example.com', created_at: Time.current, updated_at: Time.current },
        { id: SecureRandom.uuid, event_type_id: event_type.id, start: earlier, "end" => earlier + 30.minutes, guest_name: 'Earlier', guest_email: 'earlier@example.com', created_at: Time.current, updated_at: Time.current }
      ])

      get '/admin/bookings'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
      expect(json[0]['guestName']).to eq('Earlier')
      expect(json[1]['guestName']).to eq('Later')
    end
  end
end
