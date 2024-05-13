---
question: How to install bun?
keywords:
    - "install"
    - "installation"
    - "installing"
    - "install bun"
    - "installing bun"
    - "installation bun"
    - "installation of bun"
    - "how to"
    - "linux"
    - "macos"
    - "windows"
---

If you're on **Linux or macOS**, you can install bun using the following command:
```bash
curl -fsSL https://bun.sh/install.sh | bash

# or if you want specific version
curl -fsSL https://bun.sh/install.sh | bash -s "bun-v1.0.0"
```

If you're on **Windows**, you can install bun using the following command:
```ps
powershell -c "irm bun.sh/install.ps1|iex"

# or if you want specific version
powershell -c "& {$(irm bun.sh/install.ps1)} -Version 1.1.4"
```