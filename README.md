# Mai Làm's blog

Long-form writing and news from Mai Làm Labs, across its projects, published at
[blog.mailam.app](https://blog.mailam.app/).

- **Posts** are in `docs/posts/`, one Markdown file each, with a `date`, `authors` (from
  `docs/.authors.yml`), a project under `categories`, and a `slug` for the URL. The text above
  `<!-- more -->` is the excerpt on the front page. A post with `draft: true` is left out of the
  site until it's removed.
- **Notes** are in `notes/`: briefs, outlines and research behind the posts, and
  `notes/style.md`, how the posts should read. They aren't published.
- **The look** is `docs/stylesheets/extra.css` over Zensical's theme, with
  `docs/javascripts/recent.js` for the sidebar's recent posts and `overrides/` for the
  template changes (the front page's title, and the header's site name linking to it).

## Building

```sh
make install   # the toolchain, inside the project
make serve     # a preview at http://localhost:8010, drafts included
make build     # the site, in dist/site
```

Pushing to `main` publishes the site to GitHub Pages.

## License

The writing is under [CC0 1.0](LICENSE). © mai-lam-labs.
