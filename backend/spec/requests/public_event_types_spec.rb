require 'rails_helper'

RSpec.describe 'Public::EventTypes', type: :request do
  describe 'GET /public/event-types' do
    it 'returns all published event types' do
      create(:event_type, id: 'demo', title: 'Demo', duration_minutes: 30)
      create(:event_type, id: 'consultation', title: 'Consultation', duration_minutes: 60)

      get '/public/event-types'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
    end
  end
end
