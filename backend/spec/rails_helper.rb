ENV['RAILS_ENV'] = 'test'
require 'spec_helper'
require_relative '../config/environment'
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'rspec/rails'

RSpec.configure do |config|
  config.use_transactional_fixtures = true

  # Clean database before test suite starts
  config.before(:suite) do
    Booking.delete_all
    EventType.delete_all
  end

  config.include FactoryBot::Syntax::Methods
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end
