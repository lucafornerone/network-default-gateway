import {
  AddressFamily,
  DefaultInterfaceNotFoundError,
  Spawner,
  UnixAddressFamily,
} from '../../types.ts';

/**
 * Generates the command to retrieve the default network route for the specified address family on macOS.
 *
 * This function constructs the appropriate command to query the system's default network route
 * based on the given address family (IPv4 or IPv6).
 *
 * @param {AddressFamily} addressFamily - The address family to filter by (either `IPv4` or `IPv6`).
 * @returns {string[]} An array representing the command and its arguments to retrieve the default route.
 */
export function defaultRouteCommand(addressFamily: AddressFamily): string[] {
  const address = addressFamily === AddressFamily.IPv4 ? '-inet' : '-inet6';
  return ['route', '-n', 'get', address, 'default'];
}

/**
 * Generates the command to retrieve detailed information about a specific network interface on macOS.
 *
 * @param {string} int - The name of the network interface (e.g., 'en0').
 * @returns {string[]} An array representing the command and its arguments to execute on macOS.
 */
export function interfaceDetailsCommand(int: string): string[] {
  return ['ifconfig', int];
}

/**
 * Generates the command to search for a specific string using `grep`.
 *
 * @param {string} value - The string to search for in the command output.
 * @returns {string[]} An array representing the command and its arguments for `grep` to execute.
 */
function grepCommand(value: string): string[] {
  return ['grep', value];
}

/**
 * Extracts a value from a given input string by first filtering rows with a `grep` command and then extracting the second field using `awk`.
 *
 * This function spawns the `grep` command to filter rows containing a specific key, then processes the resulting output with the `awk` command to extract the second field (value).
 *
 * @param {Spawner} spawner - The function used to spawn commands.
 * @param {string} input - The input string to process.
 * @param {string} key - The key to search for in the input string using `grep`.
 * @returns {Promise<string>} A promise that resolves to the extracted value from the filtered row.
 * @throws {Error} If the `grep` or `awk` command fails.
 */
export async function valueFromRowKey(
  spawner: Spawner,
  input: string,
  key: string
): Promise<string> {
  // filter row key with grep command
  const output = await spawner(grepCommand(key), input);
  // get value with awk command
  return await spawner(['awk', '{print $2}'], output);
}

/**
 * Retrieves the IP address and prefix length for a given network interface based on the address family (IPv4 or IPv6).
 *
 * This function first checks the interface's status to ensure it is active, then retrieves the corresponding IP address and prefix length.
 * If the address family is IPv4, the prefix length is calculated from the netmask; if it's IPv6, the prefix length is directly retrieved.
 *
 * @param {Spawner} spawner - The function used to spawn commands.
 * @param {string} outputInterface - The name of the network interface (e.g., 'en0').
 * @param {AddressFamily} addressFamily - The address family to filter by (either `AddressFamily.IPv4` or `AddressFamily.IPv6`).
 * @returns {Promise<DarwinInterface>} A promise that resolves to an object containing the IP address and prefix length for the interface.
 * @throws {DefaultInterfaceNotFoundError} If the interface is not active.
 * @throws {DeviceIpNotFoundError} If the IP address for the interface cannot be found.
 * @throws {NetmaskNotFoundError} If the netmask for the interface cannot be found (IPv4).
 * @throws {PrefixLengthNotFoundError} If the prefix length for the interface cannot be found (IPv6).
 */
export async function prefixLengthAndIpByAddressFamily(
  spawner: Spawner,
  outputInterface: string,
  addressFamily: AddressFamily
): Promise<DarwinInterface> {
  // extract interface status
  const status = await valueFromRowKey(spawner, outputInterface, 'status');
  if (status !== DarwinInterfaceStatus.Active) {
    throw new DefaultInterfaceNotFoundError();
  }

  // IPv4 grep command needs a space to avoid taking the IPv6 row
  const grepAddressFamily = addressFamily === AddressFamily.IPv4 ? 'inet ' : 'inet6';
  // get IPv details by address family
  const outputIPv = await spawner(grepCommand(grepAddressFamily), outputInterface);
  // get device ip
  const inet = valueFromKey(outputIPv, UnixAddressFamily[addressFamily]);
  if (!inet) {
    throw new DeviceIpNotFoundError();
  }

  // get interface prefix length
  let prefixlen: number;
  if (addressFamily === AddressFamily.IPv4) {
    // IPv4 does not have prefix length, it must be calculated from the netmask
    const netmask = valueFromKey(outputIPv, 'netmask');
    if (!netmask) {
      throw new NetmaskNotFoundError();
    }
    prefixlen = netmaskToPrefixLength(netmask);
  } else {
    const v6Prefixlen = valueFromKey(outputIPv, 'prefixlen');
    if (!v6Prefixlen) {
      throw new PrefixLengthNotFoundError();
    }
    prefixlen = +v6Prefixlen;
  }

  return {
    prefixlen,
    inet,
  };
}

/**
 * Extracts the value associated with a specified key from an input string.
 *
 * This function splits the input string by whitespace and searches for the given key. If the key is found, the function returns
 * the value that follows the key. If the key is not found or there is no value after it, the function returns `null`.
 *
 * @param {string} input - The input string to search within.
 * @param {string} key - The key to search for in the input string.
 * @returns {string | null} The value associated with the key, or `null` if the key is not found or has no value.
 */
function valueFromKey(input: string, key: string): string | null {
  const parts = input.split(/\s+/);
  const index = parts.indexOf(key);

  if (index !== -1 && index + 1 < parts.length) {
    return parts[index + 1];
  }

  return null;
}

/**
 * Converts a netmask (in hexadecimal format) to its corresponding prefix length.
 *
 * This function converts the netmask from hexadecimal to binary and counts the number of `1` bits to calculate the prefix length.
 * If the prefix length exceeds 32, an error is thrown.
 *
 * @param {string} netmask - The netmask in hexadecimal format (e.g., 'FFFFFF00').
 * @returns {number} The prefix length corresponding to the given netmask.
 * @throws {PrefixLengthNotValidError} If the calculated prefix length exceeds 32.
 */
function netmaskToPrefixLength(netmask: string): number {
  const binary = parseInt(netmask, 16).toString(2);
  const prefixLength = binary.split('').filter((bit) => bit === '1').length;

  if (prefixLength > 32) {
    throw new PrefixLengthNotValidError();
  }

  return prefixLength;
}

interface DarwinInterface {
  inet: string;
  prefixlen: number;
}

export enum DarwinInterfaceStatus {
  Active = 'active',
  Inactive = 'inactive',
}

class DeviceIpNotFoundError extends Error {
  constructor() {
    super('Default ip not found');
    this.name = 'DeviceIpNotFoundError';
  }
}

class NetmaskNotFoundError extends Error {
  constructor() {
    super('Netmask not found');
    this.name = 'NetmaskNotFoundError';
  }
}

class PrefixLengthNotFoundError extends Error {
  constructor() {
    super('Prefix length not found');
    this.name = 'PrefixLengthNotFoundError';
  }
}

class PrefixLengthNotValidError extends Error {
  constructor() {
    super('Prefix length not valid');
    this.name = 'PrefixLengthNotValidError';
  }
}
