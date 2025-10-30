import {
  AddressFamily,
  DefaultGatewayNotAvailableError,
  IPlatform,
  NetworkDefaultGateway,
  Spawner,
} from '../../types.ts';
import {
  defaultInterfaceByAddressFamily,
  IpAddr,
  IpRoute,
  ipDefaultRouteCommand,
  ipInterfaceDetailsCommand,
  LinuxInterface,
  mergeRoutesWithAddresseses,
  spawnCommandAndParse,
} from './linux-utils.ts';

export class LinuxPlatform implements IPlatform {
  constructor(private spawner: Spawner) {}

  /**
   * Retrieves the default gateway for the specified address family (IPv4 or IPv6) on Linux.
   *
   * This function uses the spawner of the current runtime to execute the necessary system commands to retrieve the default network routes.
   * It then collects the IP addresses for each route and merges the IP route information with the corresponding interface details.
   * Finally, it identifies the default network interface based on the address family and returns an object with the relevant
   * gateway details, including IP address, gateway, interface name, and prefix length.
   *
   * @param {AddressFamily} addressFamily - The address family to filter by (either `IPv4` or `IPv6`).
   * @returns {Promise<NetworkDefaultGateway>} A promise that resolves to an object containing the default gateway details:
   * - `ip`: The IP address of the default interface.
   * - `gateway`: The gateway address.
   * - `interface`: The name of the network interface.
   * - `prefixLength`: The prefix length of the interface.
   * @throws {DefaultGatewayNotAvailableError} If no default gateway is available for the specified address family.
   * @throws {JSONParsingSpawnerOutputError} If the output from a system command cannot be parsed as valid JSON.
   * @throws {DefaultInterfaceNotFoundError} If no default network interface is found for the specified address family.
   */
  async defaultGateway(addressFamily: AddressFamily): Promise<NetworkDefaultGateway> {
    // get default ip routes
    const ipRoutes: IpRoute[] = await spawnCommandAndParse<IpRoute>(
      this.spawner,
      ipDefaultRouteCommand(addressFamily)
    );
    if (ipRoutes.length === 0) {
      throw new DefaultGatewayNotAvailableError();
    }

    // get details for each route
    const commands = ipRoutes.map((r) =>
      spawnCommandAndParse<IpAddr>(this.spawner, ipInterfaceDetailsCommand(r.dev))
    );
    const ipAddresses: IpAddr[] = (await Promise.all(commands)).flat();

    // merge spawn outputs
    const interfaces: LinuxInterface[] = mergeRoutesWithAddresseses(ipRoutes, ipAddresses);

    // found default interface
    const defaultInterface = defaultInterfaceByAddressFamily(interfaces, addressFamily);
    return {
      ip: defaultInterface.local,
      gateway: defaultInterface.gateway,
      interface: defaultInterface.ifname,
      prefixLength: defaultInterface.prefixlen,
    };
  }
}
