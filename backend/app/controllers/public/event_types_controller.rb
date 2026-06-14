class Public::EventTypesController < ApplicationController
  def index
    event_types = EventType.all
    render json: event_types
  end
end
