// The newest posts as quick links at the foot of the left sidebar, read from the site's JSON feed
// (newest first). They go in the primary sidebar, which is the drawer on narrow screens (on a
// post too, where it's hidden on wide ones), and in a post's own sidebar, which is beside the
// post on wide screens (extra.css hides them there on narrow ones, where it moves under it).
(() => {
  const RECENT = 5;
  const config = JSON.parse(document.getElementById("__config").textContent);
  const root = new URL(config.base + "/", location.href);

  fetch(new URL("feed_json_created.json", root))
    .then((response) => response.json())
    .then((feed) => {
      if (feed.items.length === 0) return;
      for (const sidebar of document.querySelectorAll(
        ".md-sidebar--post .md-sidebar__inner, .md-sidebar--primary .md-sidebar__inner",
      )) {
        sidebar.append(recent(feed));
      }
    });

  function recent(feed) {
    const nav = document.createElement("nav");
    nav.className = "md-nav md-recent";
    const title = document.createElement("div");
    title.className = "md-recent__title";
    title.textContent = "Recent";
    const list = document.createElement("ul");
    list.className = "md-nav__list";

    for (const item of feed.items.slice(0, RECENT)) {
      // the feed's URLs are absolute (the published site's); keep their path, on this site
      const url = new URL(new URL(item.url).pathname.replace(/^\//, ""), root);
      const link = document.createElement("a");
      link.className = "md-nav__link";
      link.href = url.href;
      link.textContent = item.title;
      if (url.pathname === location.pathname) link.classList.add("md-nav__link--active");
      const entry = document.createElement("li");
      entry.className = "md-nav__item";
      entry.append(link);
      list.append(entry);
    }

    nav.append(title, list);
    return nav;
  }
})();
