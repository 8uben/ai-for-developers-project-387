Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  scope module: "admin" do
    get "/admin/event-types", to: "event_types#index"
    post "/admin/event-types", to: "event_types#create"
    get "/admin/bookings", to: "bookings#index"
  end

  scope module: "public" do
    get "/public/event-types", to: "event_types#index"

    scope "/public/event-types/:event_type_id" do
      get "/slots", to: "slots#index"
      post "/bookings", to: "bookings#create"
    end
  end
end
