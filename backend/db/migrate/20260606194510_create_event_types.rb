class CreateEventTypes < ActiveRecord::Migration[8.1]
  def change
    create_table :event_types, id: false do |t|
      t.string :id, null: false, primary_key: true
      t.string :title, null: false
      t.text :description, null: false
      t.integer :duration_minutes, null: false

      t.timestamps
    end
  end
end
