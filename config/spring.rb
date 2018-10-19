%w(
  .ruby-version
  .rbenv-vars
  tmp/restart.txt
  tmp/caching-dev.txt
  app/notifiers
).each { |path| Spring.watch(path) }
