# Faclon Labs — application shells

Two shells and a demo. They answer different questions, and mixing them would
force one of them to give up its defining property — which is why they are two
packages rather than one with a flag.

| | `@faclon-labs/app-shell` | `@faclon-labs/iosense-shell` |
|---|---|---|
| **Runtime deps** | react + react-dom, nothing else | design-sdk, fds, lucide-react |
| **Look** | its own tokens, restyle it freely | the iosense product's, exactly |
| **Use it when** | you want *a* shell | you want *this* shell |
| **Source** | [`packages/app-shell`](packages/app-shell) | [`packages/iosense-shell`](packages/iosense-shell) |

**Both ship empty.** The nav, the logo, the footer, the profile and the
notifications are all things you pass in. What the packages ship is the
*behaviour* — the hover peek that does not move the page, the tooltip that only
fires on an unreadable label, the accordion that opens itself on a deep link,
the breadcrumb rule, the 16px content rhythm. None of that depends on which rows
are in the nav.

## Run it

```bash
npm install
npm run dev          # the demo — the iosense chrome, at http://localhost:5173
npm run storybook    # every component state, one story at a time
```

| Script | What it does |
|---|---|
| `npm run dev` | the demo in `demo/` |
| `npm run storybook` | Storybook on 6006 |
| `npm run build` | both library builds + type declarations |
| `npm run build:app-shell` | just the react-only package |
| `npm run build:iosense-shell` | just the iosense package |
| `npm run typecheck` | both packages, the demo and the stories |

> **If `npm run storybook` fails with `ERR_DLOPEN_FAILED` / `oxc-resolver`:**
> Storybook 10 resolves modules through a native binary, and its Windows build
> needs a newer Microsoft Visual C++ Redistributable (x64) than some machines
> have. Install the latest x64 redistributable and it starts. Verified that the
> file is present and the path is fine — the binary simply refuses to load
> without it, and other native modules in the same tree (lightningcss) load
> normally, so nothing else is affected. `npm run dev` does not go through it.

## Layout

```
packages/
  app-shell/        react-only. AppShell, Box/BaseBox, Stack/Grid/Card,
                    SideNavLink, Breadcrumb, tokens.css, guards/
  iosense-shell/    the product chrome. IosenseShell, AppSideNav, AppTopBar,
                    the menus, navItems.ts, theme-overrides.css, guards/
demo/               a runnable consumer — imports the packages BY NAME
stories/            one story file per section of STORY.md
STORY.md            the structure document: what each part is, what ships
                    fixed, and what you can change
```

**The demo imports both packages by their published names**, not by relative
path. That is the point of it: if the demo compiles, the exports maps are
complete. A relative import into a package's internals would hide a missing
export until someone outside the repo hit it.

## Read next

- **[STORY.md](STORY.md)** — the shell part by part. Header, nav entity,
  accordion, section, footer, top bar, content container. Start here.
- **[packages/iosense-shell/README.md](packages/iosense-shell/README.md)** — the
  stylesheet contract, the nav data model, the content container's spacing rule.
- **`guards/` in each package** — machine-readable usage contracts: what each
  component is for, which prop combinations are illegal, and the anti-patterns
  that keep recurring. `guards/index.json` lists them and carries the invariants.
