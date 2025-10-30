import { AddressFamily, IPlatform, NetworkDefaultGateway, Spawner } from '../../types.ts';
import {
  defaultInterfaceByAddressFamily,
  NetIpAddress,
  NetRoute,
  netIpAddressCommand,
  netRouteCommand,
  spawnCommandAndParse,
  WindowsInterface,
} from './windows-utils.ts';

export class WindowsPlatform implements IPlatform {
  constructor(private spawner: Spawner) {}

  /**
   * Retrieves the default gateway for the specified address family (IPv4 or IPv6) on Windows.
   *
   * This function uses the spawner of the current runtime to execute the necessary system commands to retrieve the default network routes.
   * It then fetches the IP address details for each route and merges the route information with the corresponding network IP addresses.
   * Finally, it identifies the default network interface based on the address family and returns an object with the relevant
   * gateway details, including IP address, gateway, interface name, and prefix length.
   *
   * @param {AddressFamily} addressFamily - The address family to filter by (either `IPv4` or `IPv6`).
   * @returns {Promise<NetworkDefaultGateway>} A promise that resolves to an object containing the default gateway details:
   * - `ip`: The IP address of the default interface.
   * - `gateway`: The gateway address.
   * - `interface`: The name of the network interface.
   * - `prefixLength`: The prefix length of the interface.
   * @throws {DefaultGatewayNotAvailableError} If no default gateway information is available.
   * @throws {JSONParsingSpawnerOutputError} If the output from the system command cannot be parsed as JSON.
   * @throws {DefaultInterfaceNotFoundError} If no default network interface is found for the specified address family.
   * @throws {NoAvailableNetworkError} If no interfaces in the "Preferred" state are found.
   */
  async defaultGateway(addressFamily: AddressFamily): Promise<NetworkDefaultGateway> {
    // get default net routes
    const netRoutes: NetRoute[] = await spawnCommandAndParse<NetRoute>(
      this.spawner,
      netRouteCommand(addressFamily)
    );

    // get details for each route
    const ids = netRoutes.map((r) => r.ifIndex);
    const netIpAddresses: NetIpAddress[] = await spawnCommandAndParse<NetIpAddress>(
      this.spawner,
      netIpAddressCommand(ids)
    );

    // merge spawn outputs
    const interfaces: WindowsInterface[] = netRoutes.flatMap((route) =>
      netIpAddresses
        .filter((address) => address.ifIndex === route.ifIndex)
        .map((address) => ({ ...route, ...address }))
    );

    // found default interface
    const defaultInterface = defaultInterfaceByAddressFamily(interfaces, addressFamily);
    return {
      ip: defaultInterface.IPAddress,
      gateway: defaultInterface.NextHop,
      interface: defaultInterface.InterfaceAlias,
      prefixLength: defaultInterface.PrefixLength,
    };
  }
}
