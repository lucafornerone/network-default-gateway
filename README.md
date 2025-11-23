# network-default-gateway
[![CI](https://github.com/lucafornerone/network-default-gateway/workflows/CI/badge.svg)](https://github.com/lucafornerone/network-default-gateway/actions?query=workflow%3ACI)

## Purpose

Effortlessly discover machine's default gateway with zero external dependency. This package provides the IP address, gateway, interface name, and prefix length, automatically detecting the runtime environment and platform.

It includes runtime-specific code for Bun, Deno, and Node, along with OS-specific code. Both types of code are only loaded when necessary, ensuring minimal impact on performance.

## How it works

This package retrieves the default gateway by spawning OS-level commands, which are available by default on each system and require no additional installation. Specifically:

- Linux: `ip`
- macOS: `route`  and `ifconfig`
- Windows: PowerShell’s `Get-NetRoute` and `Get-NetIPAddress`

The commands are spawned through the active runtime. Specifically:

- Bun: `Bun.spawn`
- Deno: `Deno.Command`
- Node: `spawn` from `child_process`

The output of these commands is parsed into `JSON` (on Linux and Windows) or processed using `grep` and `awk` (on macOS), ensuring a consistent key–value structure for all retrieved information.

It is ESM-only and fully written in TypeScript. It is available on JSR and npm.

## Works on
The package has been tested and works correctly on the following operating systems and runtimes:

|             | Bun  | Deno | Node |
|-------------|------|------|------|
| **macOS**   |  ✔  |  ✔   |  ✔  |
| **Linux**   |  ✔  |  ✔   |  ✔  |
| **Windows** |  ✔  |  ✔   |  ✔  |

## JSR

For complete installation and usage details with JSR, visit the [package page](https://jsr.io/@lucafornerone/network-default-gateway).

From JSR, you can install the package and access documentation for all available methods. It is recommended for use with Bun and Deno, with sources available directly in TypeScript.

## npm

Installation:

```bash
npm install network-default-gateway
```

IPv4 import:

```javascript
import { v4DefaultGateway } from 'network-default-gateway';
```

IPv6 import:

```javascript
import { v6DefaultGateway } from 'network-default-gateway';
```

## Usage example

IPv4:

```javascript
(async () => {
  // Get default gateway details for IPv4 address
  const defaultGateway = await v4DefaultGateway();
  console.log(defaultGateway);
  /*
  {
    ip: '192.168.1.15',
    gateway: '192.168.1.1',
    interface: 'eth1',
    prefixLength: 24
  }
  */
})();
```

IPv6:

```javascript
(async () => {
  // Get default gateway details for IPv6 address
  const defaultGateway = await v6DefaultGateway();
  console.log(defaultGateway);
  /*
  {
    ip: 'fe80::1a2b:3c4d:5e6f:7g8h',
    gateway: 'fe80::1',
    interface: 'eth1',
    prefixLength: 64
  }
  */
})();
```

## Test

Bun:

```bash
bun test test/bun.test.ts
```

Deno:

```bash
deno test test/deno.test.ts --allow-run
```

Node:

```bash
npm install
npm run test
```

## Contribute

I'm happy to welcome any contribution, big or small, feel free to contribute however you prefer! Whether it's code or just suggestions, everything is appreciated.
Please use the GitHub Discussions section to share your ideas or ask questions.

This package is being developed to replace [default-gateway](https://github.com/silverwind/default-gateway) package, which has been marked by the creator with "Intention to deprecate this module". We encourage contributions to help us achieve this ambitious goal.

## License

network-default-gateway is [MIT licensed](LICENSE).
