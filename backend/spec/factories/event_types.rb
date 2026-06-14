FactoryBot.define do
  factory :event_type do
    sequence(:id) { |n| "event-type-#{n}" }
    title { "Test Meeting" }
    description { "A test meeting type" }
    duration_minutes { 30 }
  end
end
