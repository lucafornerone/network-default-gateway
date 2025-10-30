import { currentPlatform, currentRuntime } from './src/common.ts';
import { AddressFamily, NetworkDefaultGateway } from './src/types.ts';

/**
 * Retrieves the default IPv4 gateway for the current runtime and platform.
 *
 * This function first determines the current runtime and platform, then uses the platform's `defaultGateway` method
 * to retrieve the default IPv4 gateway. It returns an object containing the default gateway details, including the IP address,
 * gateway, interface name, and prefix length for the IPv4 address family.
 *
 * @example
 * ```typescript
 * const defaultGateway = await v4DefaultGateway();
 * console.log(defaultGateway); // { ip: '192.168.1.15', gateway: '192.168.1.1', interface: 'eth1', prefixLength: 24 }
 * ```
 *
 * @returns {Promise<NetworkDefaultGateway>} A promise that resolves to an object containing the default IPv4 gateway details:
 * - `ip`: The IPv4 address of the default interface.
 * - `gateway`: The gateway address.
 * - `interface`: The name of the network interface.
 * - `prefixLength`: The prefix length of the interface.
 * @throws {NoAvailableNetworkError} If no available network route is found.
 * @throws {DefaultInterfaceNotFoundError} If no default network interface is found for the specified address family.
 */
export async function v4DefaultGateway(): Promise<NetworkDefaultGateway> {
  const runtime = await currentRuntime();
  const platform = await currentPlatform(runtime);
  return await platform.defaultGateway(AddressFamily.IPv4);
}

/**
 * Retrieves the default IPv6 gateway for the current runtime and platform.
 *
 * This function first determines the current runtime and platform, then uses the platform's `defaultGateway` method
 * to retrieve the default IPv6 gateway. It returns an object containing the default gateway details, including the IP address,
 * gateway, interface name, and prefix length for the IPv6 address family.
 *
 * @example
 * ```typescript
 * const defaultGateway = await v6DefaultGateway();
 * console.log(defaultGateway); // { ip: 'fe80::1a2b:3c4d:5e6f:7g8h', gateway: 'fe80::1', interface: 'eth1', prefixLength: 64 }
 * ```
 *
 * @returns {Promise<NetworkDefaultGateway>} A promise that resolves to an object containing the default IPv6 gateway details:
 * - `ip`: The IPv6 address of the default interface.
 * - `gateway`: The gateway address.
 * - `interface`: The name of the network interface.
 * - `prefixLength`: The prefix length of the interface.
 * @throws {NoAvailableNetworkError} If no available network route is found.
 * @throws {DefaultInterfaceNotFoundError} If no default network interface is found for the specified address family.
 */
export async function v6DefaultGateway(): Promise<NetworkDefaultGateway> {
  const runtime = await currentRuntime();
  const platform = await currentPlatform(runtime);
  return await platform.defaultGateway(AddressFamily.IPv6);
}
