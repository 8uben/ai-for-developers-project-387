class SpaFallback
  def initialize(app)
    @app = app
  end

  def call(env)
    status, headers, response = @app.call(env)

    if status == 404
      path = env["PATH_INFO"]
      if path.start_with?("/rails/") || path.start_with?("/up")
        [ status, headers, response ]
      else
        [ 200, { "Content-Type" => "text/html" }, [ File.read(Rails.root.join("public", "index.html")) ] ]
      end
    else
      [ status, headers, response ]
    end
  end
end
