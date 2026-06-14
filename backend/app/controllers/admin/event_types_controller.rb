class Admin::EventTypesController < ApplicationController
  def index
    event_types = EventType.order(created_at: :desc)
    render json: event_types
  end

  def create
    event_type = EventType.new(event_type_params)
    if event_type.save
      render json: event_type, status: :created
    else
      id_error = event_type.errors.details[:id]&.find { |d| d[:error] == :taken }
      if id_error
        render_error("duplicate_slug", "Event type with this id already exists", status: :conflict)
      else
        render_error("invalid", event_type.errors.full_messages.to_sentence, status: :bad_request)
      end
    end
  end

  private

  def event_type_params
    {
      id: params[:id],
      title: params[:title],
      description: params[:description],
      duration_minutes: params[:duration_minutes] || params[:durationMinutes]
    }
  end
end
