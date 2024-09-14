---
question: How to use tsconfig paths?
keywords:
    - "paths"
    - "baseUrl"
    - "magic"
---

The `paths` and `baseUrl` compiler options don't cause any remapping of imports paths, they only inform TS of existing mappings, which you'll have to setup with some other tool.

`baseUrl` is a pretty well-supported option (e.g. using the `NODE_PATH` environment variable with node or `resolve.modules` with webpack).
`paths` can be trickier to setup, (see [this](https://nodejs.org/api/packages.html#packages_subpath_imports)), and you may find it to not be worth the effort.