class MonitorJob
  include SuckerPunch::Job

  def perform()
    ActiveRecord::Base.connection_pool.with_connection do
      Setting.instance # check sucker punch db connection
    end
  end
end
