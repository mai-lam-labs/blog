// The newest posts as quick links at the foot of the left sidebar, on the front page and on
// each post, read from the site's JSON feed (newest first).
(() => {
  const RECENT = 5;
  const config = JSON.parse(document.getElementById("__config").textContent);
  const root = new URL(config.base + "/", location.href);

  fetch(new URL("feed_json_created.json", root))
    .then((response) => response.json())
    .then((feed) => {
      const sidebar = document.querySelector(
        ".md-sidebar--post:not([hidden]) .md-sidebar__inner, " +
          ".md-sidebar--primary:not([hidden]) .md-sidebar__inner",
      );
      if (!sidebar || feed.items.length === 0) return;

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
      sidebar.append(nav);
    });
})();
