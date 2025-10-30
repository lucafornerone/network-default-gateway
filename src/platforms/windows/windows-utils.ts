import {
  AddressFamily,
  DefaultGatewayNotAvailableError,
  DefaultInterfaceNotFoundError,
  JSONParsingSpawnerOutputError,
  NoAvailableNetworkError,
  Spawner,
} from '../../types.ts';

/**
 * Generates a PowerShell command to retrieve network routes for the specified address family.
 *
 * The command filters routes based on the destination prefix (either IPv4 or IPv6) and selects
 * relevant properties such as the interface index, next hop, and interface metric. The result
 * is converted to JSON format for easier parsing.
 *
 * @param addressFamily - The address family (IPv4 or IPv6) to filter the network routes.
 * @returns An array containing the PowerShell command and its arguments.
 */
export function netRouteCommand(addressFamily: AddressFamily): string[] {
  const destinationPrefix = addressFamily === AddressFamily.IPv4 ? '0.0.0.0/0' : '::/0';
  return [
    'powershell',
    `Get-NetRoute | Where-Object { $_.DestinationPrefix -eq "${destinationPrefix}" } | Select-Object -Property ifIndex, NextHop, InterfaceMetric | ConvertTo-Json`,
  ];
}

/**
 * Generates the PowerShell command to retrieve IP address details for specific network interfaces on Windows.
 *
 * This function creates a PowerShell command that filters the network interfaces by their `InterfaceIndex`, selects specific properties
 * (like `ifIndex`, `IPAddress`, `InterfaceAlias`, `AddressFamily`, `PrefixLength`, and `AddressState`), and converts the output to JSON format.
 *
 * @param {number[]} ids - The list of interface indices to filter by.
 * @returns {string[]} An array representing the PowerShell command and its arguments.
 */
export function netIpAddressCommand(ids: number[]): string[] {
  return [
    'powershell',
    `Get-NetIPAddress | Where-Object { @(${ids.join(',')}) -contains $_.InterfaceIndex } | Select-Object -Property ifIndex, IPAddress, InterfaceAlias, AddressFamily, PrefixLength, AddressState | ConvertTo-Json`,
  ];
}

/**
 * Executes a command using the provided spawner function and parses the output as JSON.
 *
 * This function runs the command represented by `cmds`, waits for the output, and parses it from JSON.
 * If the parsed output is not an array, it is wrapped in an array. If the output is empty, an error is thrown.
 *
 * @param {Spawner} spawner - The function used to spawn commands.
 * @param {string[]} cmds - The command and its arguments to execute.
 * @returns {Promise<T[]>} A promise that resolves to an array of parsed objects of type `T`.
 * @throws {DefaultGatewayNotAvailableError} If the command output is empty.
 * @throws {JSONParsingSpawnerOutputError} If the output cannot be parsed as JSON.
 */

export async function spawnCommandAndParse<T>(spawner: Spawner, cmds: string[]): Promise<T[]> {
  const rawOutput = await spawner(cmds);
  if (!rawOutput) {
    throw new DefaultGatewayNotAvailableError();
  }

  try {
    const output: T | T[] = JSON.parse(rawOutput);
    return Array.isArray(output) ? output : [output];
  } catch (_error) {
    throw new JSONParsingSpawnerOutputError();
  }
}

/**
 * Finds the default network interface based on the address family (IPv4 or IPv6) and the preferred state.
 *
 * This function filters the provided interfaces by address family. If no interfaces match, an error is thrown.
 * It then filters by interfaces in the "Preferred" state. If none are found, another error is thrown.
 * Finally, it returns the interface with the lowest `InterfaceMetric`, representing the most preferred interface.
 *
 * @param {WindowsInterface[]} interfaces - The list of network interfaces to search through.
 * @param {keyof typeof WindowsAddressFamily} addressFamily - The address family to filter by (either `IPv4` or `IPv6`).
 * @returns {WindowsInterface} The default network interface with the lowest `InterfaceMetric` in the "Preferred" state.
 * @throws {DefaultInterfaceNotFoundError} If no interface matches the specified address family.
 * @throws {NoAvailableNetworkError} If no interfaces are found in the "Preferred" state.
 */
export function defaultInterfaceByAddressFamily(
  interfaces: WindowsInterface[],
  addressFamily: keyof typeof WindowsAddressFamily
): WindowsInterface {
  // filter by address family
  const familyInterfaces = interfaces.filter(
    (int) => int.AddressFamily === WindowsAddressFamily[addressFamily]
  );
  if (familyInterfaces.length === 0) {
    throw new DefaultInterfaceNotFoundError();
  }

  // filter by valid state
  const activeInterfaces = familyInterfaces.filter(
    (int) => int.AddressState === WindowsAddressState.Preferred
  );
  if (activeInterfaces.length === 0) {
    throw new NoAvailableNetworkError();
  }

  // get one with lower InterfaceMetric
  return activeInterfaces.reduce((prev, curr) =>
    prev.InterfaceMetric < curr.InterfaceMetric ? prev : curr
  );
}

export type NetRoute = {
  ifIndex: number;
  NextHop: string;
  InterfaceMetric: number;
};

export type NetIpAddress = {
  ifIndex: number;
  IPAddress: string;
  InterfaceAlias: string;
  AddressFamily: number;
  PrefixLength: number;
  AddressState: number;
};

export type WindowsInterface = NetRoute & NetIpAddress;

enum WindowsAddressFamily {
  IPv4 = 2,
  IPv6 = 23,
}

enum WindowsAddressState {
  Invalid = 0,
  Tentative = 1,
  Duplicate = 2,
  Deprecated = 3,
  Preferred = 4,
}
