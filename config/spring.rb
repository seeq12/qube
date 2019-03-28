%w(
  .ruby-version
  .rbenv-vars
  tmp/restart.txt
  tmp/caching-dev.txt
  app/notifiers
  app/serializers
).each { |path| Spring.watch(path) }
