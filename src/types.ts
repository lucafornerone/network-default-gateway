export interface NetworkDefaultGateway {
  ip: string;
  gateway: string;
  interface: string;
  prefixLength: number;
}

export enum AddressFamily {
  IPv4 = 'IPv4',
  IPv6 = 'IPv6',
}

export enum Platform {
  MacOS = 'darwin',
  Linux = 'linux',
  Windows = 'windows',
}

export enum Runtime {
  Bun = 'bun',
  Deno = 'deno',
  Node = 'node',
}

export interface IRuntime {
  platform(): Platform;
  spawnCommand(cmds: string[], processInput?: string): Promise<string>;
}

export interface IPlatform {
  defaultGateway(addressFamily: AddressFamily): Promise<NetworkDefaultGateway>;
}

export type Spawner = (cmds: string[], processInput?: string) => Promise<string>;

export enum UnixAddressFamily {
  IPv4 = 'inet',
  IPv6 = 'inet6',
}

export class DefaultGatewayNotAvailableError extends Error {
  constructor() {
    super('Default gateway not available');
    this.name = 'DefaultGatewayNotAvailableError';
  }
}

export class RuntimeNotSupportedError extends Error {
  constructor() {
    super('Runtime not supported');
    this.name = 'RuntimeNotSupportedError';
  }
}

export class DefaultInterfaceNotFoundError extends Error {
  constructor() {
    super('Default interface not found');
    this.name = 'DefaultInterfaceNotFoundError';
  }
}

export class NoAvailableNetworkError extends Error {
  constructor() {
    super('Device has no available network');
    this.name = 'NoAvailableNetworkError';
  }
}

export class PlatformNotSupportedError extends Error {
  constructor(runtime: Runtime, platform: string) {
    super(`${runtime} ${platform} platform not supported`);
    this.name = 'PlatformNotSupportedError';
  }
}

export class JSONParsingSpawnerOutputError extends Error {
  constructor() {
    super('Failed to parse command output as JSON');
    this.name = 'JSONParsingSpawnerOutputError';
  }
}
