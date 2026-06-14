class Public::SlotsController < ApplicationController
  def index
    event_type = EventType.find_by(id: params[:event_type_id])
    return render_error("not_found", "Event type not found", status: :not_found) unless event_type

    timezone = params[:timezone] || "UTC"
    slots = SlotGenerator.new(event_type, timezone: timezone).call
    render json: slots
  end
end
