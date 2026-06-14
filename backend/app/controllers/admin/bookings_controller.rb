class Admin::BookingsController < ApplicationController
  def index
    bookings = Booking.joins(:event_type).order(start: :asc)
    render json: bookings
  end
end
