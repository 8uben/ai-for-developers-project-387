class Public::BookingsController < ApplicationController
  def create
    event_type = EventType.find_by(id: params[:event_type_id])
    return render_error("not_found", "Event type not found", status: :not_found) unless event_type

    booking = event_type.bookings.new(booking_params)

    if booking.save
      render json: booking, status: :created
    else
      if booking.errors[:start].any?
        handle_booking_errors(booking)
      else
        render_error("invalid", booking.errors.full_messages.to_sentence, status: :bad_request)
      end
    end
  end

  private

  def booking_params
    {
      start: params[:start],
      guest_name: params[:guest_name] || params[:guestName],
      guest_email: params[:guest_email] || params[:guestEmail]
    }
  end

  def handle_booking_errors(booking)
    error = booking.errors[:start].first

    if error.include?("already booked")
      render_error("slot_taken", "This slot is already booked", status: :conflict)
    elsif error.include?("outside")
      render_error("out_of_window", "Slot is outside the 14-day booking window", status: :bad_request)
    elsif error.include?("align")
      render_error("invalid_slot", "Slot does not align with the event duration grid", status: :bad_request)
    else
      render_error("invalid", booking.errors.full_messages.to_sentence, status: :bad_request)
    end
  end
end
