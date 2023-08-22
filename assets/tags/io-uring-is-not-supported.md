---
keywords:
    - "io-uring-is-not-supported"
    - "io uring"
    - "kernel"
    - "update"
    - "linux"
---

**error: Linux kernel version doesn't support io_uring, which Bun depends on**

To fix this error, you need to update Linux kernel.
If you are using the Windows Subsystem for Linux, do:
  **1.** Open powershell as administrator
  **2.** Run:
     - wsl --set-version <disto name> 2
       - If it throws `Please enable the Virtual Machine Platform Windows feature and ensure virtualization is enabled in the BIOS.`, turn on Virtual Machine Platform in Windows Features and then rerun this command.
       - PS: You can get distro name from `wsl --list -v` 
     - wsl --update
     - wsl --shutdown

If that doesn't work (and you're on a Windows machine), try this:
  **1.** Open Windows Update
  **2.** Download any updates to Windows Subsystem for Linux
