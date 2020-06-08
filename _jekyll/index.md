## Posts


<div class="posts">
  {% for post in site.posts %}
  <div class="post">
    <p class="post-meta">{{ post.date | date: '%B %-d, %Y' }}</p>
    <h3 class="post-title"><a href="{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></h3>
    <span class="post-summary">{{ post.summary }}</span>
  </div>
  {% endfor %}
</div>
