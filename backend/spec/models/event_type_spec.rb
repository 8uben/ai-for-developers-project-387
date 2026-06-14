require 'rails_helper'

RSpec.describe EventType, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      event_type = build(:event_type)
      expect(event_type).to be_valid
    end

    it 'is not valid without id' do
      event_type = build(:event_type, id: nil)
      expect(event_type).not_to be_valid
    end

    it 'is not valid with invalid slug format' do
      event_type = build(:event_type, id: 'Invalid_Slug')
      expect(event_type).not_to be_valid
    end

    it 'is not valid with duplicate id' do
      create(:event_type, id: 'meeting-30')
      event_type = build(:event_type, id: 'meeting-30')
      expect(event_type).not_to be_valid
    end

    it 'is not valid without title' do
      event_type = build(:event_type, title: nil)
      expect(event_type).not_to be_valid
    end

    it 'is not valid without description' do
      event_type = build(:event_type, description: nil)
      expect(event_type).not_to be_valid
    end

    it 'is not valid without duration_minutes' do
      event_type = build(:event_type, duration_minutes: nil)
      expect(event_type).not_to be_valid
    end

    it 'is not valid with duration_minutes <= 0' do
      event_type = build(:event_type, duration_minutes: 0)
      expect(event_type).not_to be_valid
    end
  end
end
