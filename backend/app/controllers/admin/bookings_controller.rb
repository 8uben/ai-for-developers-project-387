class Admin::BookingsController < ApplicationController
  def index
    bookings = Booking.joins(:event_type).order(start: :asc)
    render json: bookings
  end

  def destroy
    booking = Booking.find_by(id: params[:id])
    return render_error("not_found", "Booking not found", status: :not_found) unless booking

    booking.destroy
    render json: booking
  end
end
