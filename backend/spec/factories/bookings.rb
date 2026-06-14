FactoryBot.define do
  factory :booking do
    id { SecureRandom.uuid }
    association :event_type, factory: :event_type
    start { Time.current.utc + 1.day + 9.hours }
    guest_name { "John Doe" }
    guest_email { "john@example.com" }
  end
end
