class UserSerializer
  include FastJsonapi::ObjectSerializer
  attributes :first_name, :last_name, :current_room_id, :home_id, :state, :status, :back_by, :emotion, :present, :color, :theme, :admin, :use_pmi, :timezone, :last_room_entered_at, :last_sign_in_at, :email, :department_id
  attribute :slack_dms, if: Proc.new { |user, params| params && params[:id] == user.id }
  has_many :pinned_rooms, if: Proc.new { |user, params| params && params[:id] == user.id }
  has_many :watching, if: Proc.new { |user, params| params && params[:id] == user.id }
end
