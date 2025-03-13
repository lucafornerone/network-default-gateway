import {
  AddressFamily,
  Spawner,
  NetworkDefaultGateway,
  IPlatform,
  DefaultGatewayNotAvailableError,
} from '../../types.ts';
import {
  defaultRouteCommand,
  prefixLengthAndIpByAddressFamily,
  interfaceDetailsCommand,
  valueFromRowKey,
} from './macos-utils.ts';

export class MacOSPlatform implements IPlatform {
  constructor(private spawner: Spawner) {}

  /**
   * Retrieves the default gateway for the specified address family (IPv4 or IPv6) on macOS.
   *
   * This function uses the spawner of the current runtime to execute the necessary system commands to retrieve the default route.
   * It then extracts the gateway and interface name from the default route output and fetches the corresponding interface details.
   * Finally, it calculates the prefix length and IP address for the default interface and returns an object containing the relevant
   * gateway details, including IP address, gateway, interface name, and prefix length.
   *
   * @param {AddressFamily} addressFamily - The address family to filter by (either `IPv4` or `IPv6`).
   * @returns {Promise<NetworkDefaultGateway>} A promise that resolves to an object containing the default gateway details:
   * - `ip`: The IP address of the default interface.
   * - `gateway`: The gateway address.
   * - `interface`: The name of the network interface.
   * - `prefixLength`: The prefix length of the interface.
   * @throws {DefaultGatewayNotAvailableError} If the default gateway is not available.
   * @throws {DeviceIpNotFoundError} If the IP address of the default interface cannot be determined.
   * @throws {NetmaskNotFoundError} If the netmask information is missing or cannot be retrieved.
   * @throws {PrefixLengthNotFoundError} If the prefix length of the interface cannot be determined.
   */
  async defaultGateway(addressFamily: AddressFamily): Promise<NetworkDefaultGateway> {
    // get default route
    const outputDefaultRoute = await this.spawner(defaultRouteCommand(addressFamily));
    if (!outputDefaultRoute) {
      throw new DefaultGatewayNotAvailableError();
    }

    // extract gateway from default route output
    const gateway = await valueFromRowKey(this.spawner, outputDefaultRoute, 'gateway');
    // extract interface name from default route output
    const defaultInterface = await valueFromRowKey(this.spawner, outputDefaultRoute, 'interface');

    // get default interface details
    const outputInterface = await this.spawner(interfaceDetailsCommand(defaultInterface));

    // get prefix length and device ip from default interface
    const { prefixlen, inet } = await prefixLengthAndIpByAddressFamily(
      this.spawner,
      outputInterface,
      addressFamily
    );
    return {
      gateway,
      interface: defaultInterface,
      ip: inet,
      prefixLength: prefixlen,
    };
  }
}
