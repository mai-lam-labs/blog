# Mai Làm's blog, blog.mailam.app: built by Zensical from docs/ (zensical.toml).
# Everything stays in the project: uv, its interpreters and cache in .uv/, the venv in .venv/,
# the built site in dist/site, Zensical's cache in .cache/.
#
#   make install   the toolchain, exactly as uv.lock says
#   make build     the site, strictly (a broken link fails it)
#   make serve     a local preview at http://localhost:$(PORT) (8010), drafts included
#   make lock      re-resolve uv.lock after changing pyproject.toml

.PHONY: uv-bootstrap install lock env-check build serve clean

PYVER := 3.14
# the local preview's port
PORT  ?= 8010

TOOLS := $(CURDIR)/.uv
UV    := $(TOOLS)/uv
# uv, pinned: its installer for that version, by hash (the installer checks each platform's
# archive against its own hashes, so pinning the installer pins uv)
UV_VERSION := 0.13.5
UV_INSTALLER_SHA256 := 1c6e7f025499664633ac2dce43a210800510e9ef0625c52e034a8afdf8bf177a
VENV  := $(CURDIR)/.venv

export UV_CACHE_DIR            := $(TOOLS)/cache
export UV_PYTHON_INSTALL_DIR   := $(TOOLS)/python
export UV_PROJECT_ENVIRONMENT  := $(VENV)

uv-bootstrap:
	@test -x "$(UV)" && [ "$$("$(UV)" --version | cut -d' ' -f2)" = "$(UV_VERSION)" ] || { \
	  echo ">> installing project-local uv $(UV_VERSION) into $(TOOLS)"; \
	  mkdir -p "$(TOOLS)" && \
	  curl -LsSf "https://astral.sh/uv/$(UV_VERSION)/install.sh" -o "$(TOOLS)/uv-install.sh" && \
	  echo "$(UV_INSTALLER_SHA256)  $(TOOLS)/uv-install.sh" | sha256sum -c --quiet && \
	  env UV_UNMANAGED_INSTALL="$(TOOLS)" UV_NO_MODIFY_PATH=1 sh "$(TOOLS)/uv-install.sh"; }

install: uv-bootstrap
	"$(UV)" sync --locked --python $(PYVER)

lock: uv-bootstrap
	"$(UV)" lock --python $(PYVER)

env-check:
	@"$(UV)" sync --locked --python $(PYVER) --check >/dev/null 2>&1 || \
	  { echo "error: .venv differs from uv.lock: run 'make install'"; exit 1; }

build: env-check
	"$(VENV)/bin/zensical" build --strict

serve: env-check
	"$(VENV)/bin/zensical" serve -a localhost:$(PORT)

clean:
	rm -rf dist .cache
