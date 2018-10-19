module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      logger.add_tags 'ActionCable', current_user.name
    end

    protected

    def find_verified_user
      suppress(UncaughtThrowError) do
        if (verified_user = env['warden'].user)
          return verified_user
        end
      end
      reject_unauthorized_connection
    end
  end
end
