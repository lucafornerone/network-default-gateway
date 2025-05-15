import {
  AddressFamily,
  DefaultInterfaceNotFoundError,
  JSONParsingSpawnerOutputError,
  Spawner,
  UnixAddressFamily,
} from '../../types.ts';

/**
 * Generates the command to retrieve the default IP route for the specified address family.
 *
 * This function constructs a command using the `ip` utility to fetch the default route in JSON format.
 * The command adapts based on whether the address family is IPv4 or IPv6.
 *
 * @param {AddressFamily} addressFamily - The address family (IPv4 or IPv6) for which to retrieve the default route.
 * @returns {string[]} An array representing the command and its arguments to execute.
 */

export function ipDefaultRouteCommand(addressFamily: AddressFamily): string[] {
  const address = addressFamily === AddressFamily.IPv4 ? '-4' : '-6';
  return ['ip', address, '-j', 'route', 'show', 'default'];
}

/**
 * Generates the command to retrieve detailed information about a specific network interface in JSON format.
 *
 * @param {string} int - The name of the network interface (e.g., 'eth0').
 * @returns {string[]} An array representing the command and its arguments to execute.
 */
export function ipInterfaceDetailsCommand(int: string): string[] {
  return ['ip', '-j', 'addr', 'show', int];
}

/**
 * Spawns a command and parses its JSON output into an array of type `T`.
 *
 * Executes a command using the provided spawner function and parses the resulting output (assumed to be in JSON format) into an array of objects of type `T`.
 *
 * @param {Spawner} spawner - The function used to spawn the command.
 * @param {string[]} cmds - The command and its arguments to execute.
 * @returns {Promise<T[]>} A promise that resolves to an array of parsed objects of type `T`.
 * @throws {JSONParsingSpawnerOutputError} If the command output is not valid JSON.
 */
export async function spawnCommandAndParse<T>(spawner: Spawner, cmds: string[]): Promise<T[]> {
  const rawOutput = await spawner(cmds);
  try {
    return JSON.parse(rawOutput);
  } catch (_error) {
    throw new JSONParsingSpawnerOutputError();
  }
}

/**
 * Merges IP route details with corresponding IP address information based on the interface name.
 *
 * This function takes two arrays: one with IP route information (`ipRoutes`) and another with IP address details (`ipAddrs`).
 * It combines the data by matching the interface name (`ifname` from `ipAddrs` and `dev` from `ipRoutes`).
 * It returns a merged list of objects containing both the route and IP address details, including IPv4 and IPv6 information.
 *
 * @param {IpRoute[]} ipRoutes - The list of IP routes containing routing information, each associated with an interface name (`dev`).
 * @param {IpAddr[]} ipAddrs - The list of IP addresses, each associated with an interface name (`ifname`).
 * @returns {LinuxInterface[]} A merged list of `LinuxInterface` objects combining IP route and address details.
 */
export function mergeRoutesWithAddresseses(
  ipRoutes: IpRoute[],
  ipAddrs: IpAddr[]
): LinuxInterface[] {
  return ipRoutes.flatMap((ipRoute) =>
    ipAddrs
      .filter((ipAddr) => ipAddr.ifname === ipRoute.dev)
      .flatMap((ipAddrComplete) => {
        // addr_info contains IPv4 and IPv6 details for each interface
        return ipAddrComplete.addr_info.map((ipAddrInfo) => {
          const { addr_info, ...ipAddr } = ipAddrComplete;
          // unify ip route, ip addr and ip addr info (IPv4 or IPv6 detail)
          return {
            ...ipRoute,
            ...ipAddr,
            ...ipAddrInfo,
          };
        });
      })
  );
}

/**
 * Finds the default network interface for a given address family (IPv4/IPv6) that is in the "Up" state.
 *
 * This function filters the list of network interfaces based on the specified address family (IPv4 or IPv6),
 * and ensures that the interface is in the "Up" operational state. It then selects the interface with the
 * lowest `InterfaceMetric` as the default interface.
 *
 * @param {LinuxInterface[]} interfaces - The list of network interfaces to search through.
 * @param {keyof typeof UnixAddressFamily} addressFamily - The address family to filter by (either 'IPv4' or 'IPv6').
 * @returns {LinuxInterface} The default network interface that matches the criteria.
 * @throws {DefaultInterfaceNotFoundError} If no interface matching the criteria is found.
 */
export function defaultInterfaceByAddressFamily(
  interfaces: LinuxInterface[],
  addressFamily: keyof typeof UnixAddressFamily
): LinuxInterface {
  const filteredInterfaces = interfaces
    // filter by address family
    .filter((int) => int.family === UnixAddressFamily[addressFamily])
    // filter by valid state
    .filter((int) => int.operstate === LinuxOperstate.Up);

  if (filteredInterfaces.length === 0) {
    throw new DefaultInterfaceNotFoundError();
  }

  // get one with lower InterfaceMetric
  return filteredInterfaces.reduce((prev, curr) => (prev.metric < curr.metric ? prev : curr));
}

export type IpRoute = {
  dst: string;
  gateway: string;
  dev: string;
  protocol: string;
  metric: number;
};

export type IpAddr = {
  ifname: string;
  operstate: string;
  addr_info: IpAddrInfo[];
};

export type IpAddrInfo = {
  family: string;
  local: string;
  prefixlen: number;
};

export type LinuxInterface = IpRoute & Omit<IpAddr, 'addr_info'> & IpAddrInfo;

enum LinuxOperstate {
  Up = 'UP',
  Down = 'DOWN',
  Unknown = 'UNKNOWN',
  Dormant = 'DORMANT',
  NotPresent = 'NOTPRESENT',
  Loopback = 'LOOPBACK',
}
