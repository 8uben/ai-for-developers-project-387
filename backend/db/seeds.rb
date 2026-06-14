EventType.find_or_create_by!(id: "demo") do |et|
  et.title = "Demo"
  et.description = "Demo call"
  et.duration_minutes = 30
end
