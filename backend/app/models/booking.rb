class Booking < ApplicationRecord
  belongs_to :event_type, foreign_key: :event_type_id, primary_key: :id

  validates :start, presence: true
  validates :guest_name, presence: true
  validates :guest_email, format: { with: URI::MailTo::EMAIL_REGEXP }

  validate :start_within_booking_window
  validate :start_on_slot_grid
  validate :slot_not_taken

  before_validation :generate_id, on: :create
  before_validation :calculate_end

  def as_json(options = {})
    {
      id: id,
      eventTypeId: event_type_id,
      start: start.iso8601,
      "end": self[:end].iso8601,
      guestName: guest_name,
      guestEmail: guest_email,
      createdAt: created_at.iso8601
    }
  end

  private

  def generate_id
    self.id ||= SecureRandom.uuid
  end

  def calculate_end
    return unless event_type && start

    self[:end] = start + event_type.duration_minutes.minutes
  end

  def start_within_booking_window
    return unless start

    now = Time.current.utc
    window_end = now + 14.days

    if start < now.beginning_of_day || start > window_end.end_of_day
      errors.add(:start, "is outside the 14-day booking window")
    end
  end

  def start_on_slot_grid
    return unless start && event_type

    minutes_from_midnight = start.hour * 60 + start.min
    if minutes_from_midnight % event_type.duration_minutes != 0
      errors.add(:start, "does not align with the slot grid")
    end
  end

  def slot_not_taken
    return unless start && event_type

    booking_end = start + event_type.duration_minutes.minutes

    conflict = Booking.where.not(id: id)
      .where("start < ? AND \"end\" > ?", booking_end, start)
      .exists?

    if conflict
      errors.add(:start, "is already booked")
    end
  end
end
