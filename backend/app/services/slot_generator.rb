class SlotGenerator
  WORK_HOUR_START = 9
  WORK_HOUR_END = 17
  BOOKING_WINDOW_DAYS = 14

  def initialize(event_type, now: nil, timezone: "UTC")
    @event_type = event_type
    @timezone = valid_timezone?(timezone) ? timezone : "UTC"
    @now = now ? now.in_time_zone(@timezone) : Time.current.in_time_zone(@timezone)
  end

  def call
    slots = []

    Time.use_zone(@timezone) do
      current_date = @now.to_date

      BOOKING_WINDOW_DAYS.times do |day_offset|
        date = current_date + day_offset.days

        first_slot_time = calculate_first_slot(date)
        last_slot_time = date + WORK_HOUR_END.hours

        slot_time = first_slot_time
        while slot_time < last_slot_time
          slot_end = slot_time + @event_type.duration_minutes.minutes
          slots << build_slot(slot_time, slot_end)
          slot_time += @event_type.duration_minutes.minutes
        end
      end
    end

    mark_availability(slots)
  end

  private

  def valid_timezone?(tz)
    ActiveSupport::TimeZone[tz].present?
  rescue
    false
  end

  def calculate_first_slot(date)
    work_start = date + WORK_HOUR_START.hours

    if date == @now.to_date
      minutes_from_midnight = @now.hour * 60 + @now.min
      remainder = minutes_from_midnight % @event_type.duration_minutes
      first_slot_minutes = minutes_from_midnight - remainder
      first_slot = date + first_slot_minutes.minutes

      if first_slot < @now
        first_slot = first_slot + @event_type.duration_minutes.minutes
      end

      [ first_slot, work_start ].max
    else
      work_start
    end
  end

  def build_slot(start_time, end_time)
    {
      start: start_time.utc.iso8601,
      end: end_time.utc.iso8601,
      available: true
    }
  end

  def mark_availability(slots)
    now_utc = @now.utc
    bookings = Booking.where(
      "start < ? AND \"end\" > ?",
      now_utc + BOOKING_WINDOW_DAYS.days,
      now_utc
    ).to_a

    slots.each do |slot|
      slot_start = Time.parse(slot[:start])
      slot_end = Time.parse(slot[:end])

      occupied = bookings.any? do |booking|
        booking.start < slot_end && booking.end > slot_start
      end

      slot[:available] = !occupied
    end
  end
end
