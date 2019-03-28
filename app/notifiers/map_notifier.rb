class MapNotifier
  def self.user_presence(id, present)
    ActionCable.server.broadcast 'map', present: present, id: id, type: 'user'
  end

  def self.destroy_user(id)
    ActionCable.server.broadcast 'map', id: id, type: 'destroy_user'
  end

  def self.user_update(params)
    ActionCable.server.broadcast 'map', params.merge(type: 'user')
  end

  def self.room_update(id, params)
    ActionCable.server.broadcast 'map', params.merge(id: id, type: 'room')
  end

  def self.department_update(params)
    ActionCable.server.broadcast 'map', params.merge(type: 'department')
  end

  def self.destroy_department(id)
    ActionCable.server.broadcast 'map', id: id, type: 'destroy_department'
  end

  def self.floor_update(params)
    ActionCable.server.broadcast 'map', params.merge(type: 'floor')
  end

  def self.destroy_floor(id)
    ActionCable.server.broadcast 'map', id: id, type: 'destroy_floor'
  end

  def self.setting_update(params)
    ActionCable.server.broadcast 'map', params.merge(type: 'setting')
  end

  def self.guest_user_join(id, first_name, color, current_room_id)
    ActionCable.server.broadcast 'map', id: id, first_name: first_name, current_room_id: current_room_id, present: true, color: color, type: 'guest_user'
  end

  def self.guest_user_leave(id, first_name, current_room_id)
    ActionCable.server.broadcast 'map', id: id, first_name: first_name, current_room_id: current_room_id, present: false, type: 'guest_user'
  end

  def self.ghost_user_join(id, current_room_id)
    ActionCable.server.broadcast 'map', id: id, current_room_id: current_room_id, present: true, type: 'ghost_user'
  end

  def self.ghost_user_leave(id, current_room_id)
    ActionCable.server.broadcast 'map', id: id, current_room_id: current_room_id, present: false, type: 'ghost_user'
  end

  def self.join_running_meeting(params)
    ActionCable.server.broadcast 'map', params.merge(type: 'meeting')
  end

  def self.join_meeting(params)
    ActionCable.server.broadcast 'map', params.slice(:user, :meeting_url).merge(type: 'meeting')
    ActionCable.server.broadcast 'map', room_id: params[:room_id], action: 'stop', type: 'spinner'
  end

  def self.joined_meeting(user_id)
    ActionCable.server.broadcast 'map', id: user_id, type: 'meeting_joined'
  end

  def self.launch_meeting(params)
    ActionCable.server.broadcast 'map', room_id: params[:room_id], action: 'start', type: 'spinner'
    ActionCable.server.broadcast 'map', params.slice(:user, :room_id, :meeting_url).merge(try_count: 0, type: 'meeting')
    ActionCable.server.broadcast 'map', id: params[:room_id], meeting_id: params[:meeting_id], type: 'room'
  end

  def self.relaunch_meeting(params)
    ActionCable.server.broadcast 'map', params.merge(type: 'meeting')
  end

  def self.spinner_error(id)
    ActionCable.server.broadcast 'map', room_id: id, action: 'stop', type: 'spinner'
  end

  def self.spinner_stop(id)
    ActionCable.server.broadcast 'map', room_id: id, action: 'error', type: 'spinner'
  end

  def self.logout(id)
    ActionCable.server.broadcast 'map', id: id, type: 'logout'
  end

  def self.refresh_individual(id)
    ActionCable.server.broadcast 'map', id: id, type: 'refresh'
  end

  def self.refresh
    ActionCable.server.broadcast 'map', type: 'refresh'
  end
end
