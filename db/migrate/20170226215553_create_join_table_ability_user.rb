class CreateJoinTableAbilityUser < ActiveRecord::Migration
  def change
    create_join_table :abilities, :users do |t|
      # t.index [:ability_id, :user_id]
      # t.index [:user_id, :ability_id]
    end
  end
end
