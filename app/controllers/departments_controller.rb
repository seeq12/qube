class DepartmentsController < ApplicationController
  before_action :set_department, except: [:index, :create]
  before_action :authenticate_user!
  before_action :authorize_user, only: [:create, :update, :destroy]
  before_action :clear_cache, only: [:create, :update, :destroy]

  def index
    departments =
      Rails.cache.fetch("departments", expires_in: 7.days) do
        Department.all.select(:id, :name).to_json
      end

    render json: departments
  end

  def create
    @department = Department.new(department_params)

    @department.save
    render json: @department.to_json
  end

  def update
    if @department.update(department_params)
      render json: @department.to_json
    else
      render json: { errors: @department.errors.messages }, status: :bad_request
    end
  end

  def destroy
    User.where(department: @department).update(department: nil).each do |user|
      MapNotifier.user_update({ id: user.id, department_id: nil })
    end
    @department.destroy
    render json: {}
  end

  def invite
    @room = Room.find_by(id: params[:room_id])
    render json: { errors: 'room_id was not provided!' }, status: :bad_request and return unless @room.present?
    render json: { errors: 'You can only invite people to a common space.' }, status: :bad_request and return if @room.room_type == 'office'

    unreachable_users = current_user.invite_all(User.where.not(current_room: @room).where(department: @department).where(state: ['available', 'Feeling social'], present: true))
    render json: {} and return if unreachable_users.empty?
    render json: { errors: unreachable_users.join("\n") }, status: :bad_request
  end

  private

  def authorize_user
    return if current_user.admin?
    render json: { errors: "You're not authorized to to take this action!" }, status: :bad_request
  end

  def clear_cache
    Rails.cache.delete("departments")
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_department
    @department = Department.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def department_params
    params.require(:department).permit(:name)
  end
end
