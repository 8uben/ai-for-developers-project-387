require 'rails_helper'

RSpec.describe 'Public::Slots', type: :request do
  describe 'GET /public/event-types/:event_type_id/slots' do
    let(:event_type) { create(:event_type, id: 'meeting-30', duration_minutes: 30) }
    let(:now) { Time.utc(2026, 6, 1, 8, 0, 0) }

    before do
      allow(Time).to receive(:current).and_return(now)
    end

    it 'returns available slots' do
      get "/public/event-types/#{event_type.id}/slots"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to be > 0
      expect(json.first).to have_key('start')
      expect(json.first).to have_key('end')
      expect(json.first).to have_key('available')
    end

    it 'returns 404 for non-existent event type' do
      get '/public/event-types/non-existent/slots'

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['code']).to eq('not_found')
    end

    it 'generates slots for specified timezone' do
      # Europe/Moscow is UTC+3, so 09:00-17:00 MSK = 06:00-14:00 UTC
      get "/public/event-types/#{event_type.id}/slots", params: { timezone: "Europe/Moscow" }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to be > 0

      json.each do |slot|
        slot_time = Time.parse(slot['start'])
        # In UTC, working hours for Moscow are 06:00-14:00
        expect(slot_time.hour).to be >= 6
        expect(slot_time.hour).to be < 14
      end
    end
  end
end
