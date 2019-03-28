class FloorsController < ApplicationController
  before_action :set_floor, except: [:index, :create, :reorder]
  before_action :authenticate_user!
  before_action :authorize_user, only: [:create, :update, :destroy, :reorder]
  before_action :clear_cache, only: [:create, :update, :destroy, :reorder]

  def index
    floors =
      Rails.cache.fetch("floors", expires_in: 7.days) do
        Floor.all.select(:name, :id, :level, :size).to_json
      end

    render json: floors
  end

  def create
    @floor = Floor.new(floor_params)

    if @floor.save
      render json: @floor.to_json
    else
      render json: { errors: @floor.errors.messages.slice(:level, :name, :size).to_a.map { |error| [error.first.to_s, error.last.last].join(' ') } }, status: :bad_request
    end
  end

  def reorder
    params[:order].each.with_index do |floor_id, level|
      Floor.find(floor_id).update_attributes(level: level + 1)
    end
  end

  def update
    if @floor.update(floor_params)
      render json: @floor.to_json
    else
      render json: { errors: @floor.errors.messages }, status: :bad_request
    end
  end

  def destroy
    render json: { errors: 'An office with no floors is no office at all!' }, status: :bad_request if Floor.count == 1
    Room.includes(:owner).where(floor: @floor).where.not(owner: nil).update(owner: nil)

    purgatory = Room.next_open_meeting_room(Floor.where.not(id: @floor.id).first)
    User.includes(:home, :current_room).where(current_room: Room.where(floor: @floor)).update(current_room: purgatory)

    @floor.destroy
    render json: {}
  end

  private

  def authorize_user
    return if current_user.admin?
    render json: { errors: "You're not authorized to to take this action!" }, status: :bad_request
  end

  def clear_cache
    Rails.cache.delete("floors")
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_floor
    @floor = Floor.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def floor_params
    params.require(:floor).permit(:name, :level, :size)
  end
end
