require 'rails_helper'

RSpec.describe 'Admin::EventTypes', type: :request do
  describe 'GET /admin/event-types' do
    it 'returns all event types' do
      create(:event_type, id: 'meeting-30', title: '30 min meeting')
      create(:event_type, id: 'meeting-60', title: '60 min meeting')

      get '/admin/event-types'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
    end
  end

  describe 'POST /admin/event-types' do
    it 'creates an event type with valid data' do
      post '/admin/event-types', params: {
        id: 'intro-call',
        title: 'Intro Call',
        description: 'Introduction call',
        durationMinutes: 15
      }, as: :json

      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json['id']).to eq('intro-call')
      expect(EventType.count).to eq(1)
    end

    it 'returns 409 for duplicate slug' do
      create(:event_type, id: 'intro-call')

      post '/admin/event-types', params: {
        id: 'intro-call',
        title: 'Another Call',
        description: 'Duplicate',
        durationMinutes: 30
      }, as: :json

      expect(response).to have_http_status(:conflict)
      json = JSON.parse(response.body)
      expect(json['code']).to eq('duplicate_slug')
    end

    it 'returns 400 for invalid slug' do
      post '/admin/event-types', params: {
        id: 'Invalid Slug!',
        title: 'Bad',
        description: 'Invalid',
        durationMinutes: 30
      }, as: :json

      expect(response).to have_http_status(:bad_request)
    end
  end
end
