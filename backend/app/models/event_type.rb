class EventType < ApplicationRecord
  self.primary_key = "id"

  SLUG_PATTERN = /\A[a-z0-9-]+\z/

  validates :id, presence: true, format: { with: SLUG_PATTERN }, uniqueness: true
  validates :title, presence: true
  validates :description, presence: true
  validates :duration_minutes, presence: true, numericality: { greater_than: 0 }

  has_many :bookings, foreign_key: :event_type_id, dependent: :destroy

  def as_json(options = {})
    {
      id: id,
      title: title,
      description: description,
      durationMinutes: duration_minutes
    }
  end
end
