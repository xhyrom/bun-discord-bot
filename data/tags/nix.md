---
question: "How to use bun on NixOS?"
keywords:
    - "nix"
    - "nixos"
---

To use Bun on NixOS, you must install it through the nix package manager using [the `bun` package in nixpkgs](<https://search.nixos.org/packages?channel=unstable&show=bun&from=0&size=1&sort=relevance&type=packages&query=bun>):

```sh
nix-env -iA nixos.bun
```

Using `bun upgrade` or the curl installer will not work because NixOS does not provide `ld.so` which means any non-nixos linux executables will not work (you'll see "File not found" when trying to run them, even though the binary is there).
