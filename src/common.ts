import {
  IPlatform,
  IRuntime,
  Platform,
  PlatformNotSupportedError,
  Runtime,
  RuntimeNotSupportedError,
} from './types.ts';

/**
 * Maps the given runtime and OS string to a corresponding `Platform` enum value.
 *
 * @param {Runtime} runtime - The runtime environment (e.g., Deno, Node, Bun).
 * @param {string} os - The operating system identifier (e.g., 'darwin', 'linux', 'win32', 'windows').
 * @returns {Platform} The corresponding `Platform` enum value.
 * @throws {PlatformNotSupportedError} If the combination of runtime and OS is not supported.
 */
export function platformFromRuntimeOs(runtime: Runtime, os: string): Platform {
  if (os === 'darwin') {
    return Platform.MacOS;
  } else if (os === 'linux') {
    return Platform.Linux;
  } else if (runtime === Runtime.Deno ? os === 'windows' : os === 'win32') {
    // bun and node use same os naming for windows
    return Platform.Windows;
  }

  throw new PlatformNotSupportedError(runtime, os);
}

const runtimes = {
  [Runtime.Deno]: {
    check: typeof Deno !== 'undefined' && Deno.version,
    module: async () => (await import('./runtimes/deno.ts')).DenoRuntime,
  },
  [Runtime.Bun]: {
    check: typeof Bun !== 'undefined' && Bun.version,
    module: async () => (await import('./runtimes/bun.ts')).BunRuntime,
  },
  [Runtime.Node]: {
    check: typeof process !== 'undefined' && process.versions.node,
    module: async () => (await import('./runtimes/node.ts')).NodeRuntime,
  },
};

/**
 * Detects and returns the current runtime environment.
 *
 * Performs checks to identify the active runtime (e.g., Node, Deno, Bun) and dynamically loads its corresponding module.
 *
 * @returns {Promise<IRuntime>} A promise that resolves to an instance of the detected runtime.
 * @throws {RuntimeNotSupportedError} If no supported runtime is detected.
 */
export async function currentRuntime(): Promise<IRuntime> {
  // find runtime by checks
  const runtimeKey = Object.values(Runtime).find((r) => runtimes[r].check);
  if (!runtimeKey) {
    throw new RuntimeNotSupportedError();
  }

  const runtime = runtimes[runtimeKey];
  const RuntimeClass = await runtime.module();
  return new RuntimeClass();
}

const platforms = {
  [Platform.MacOS]: async () => (await import('./platforms/macos/macos-platform.ts')).MacOSPlatform,
  [Platform.Linux]: async () => (await import('./platforms/linux/linux-platform.ts')).LinuxPlatform,
  [Platform.Windows]: async () =>
    (await import('./platforms/windows/windows-platform.ts')).WindowsPlatform,
};

/**
 * Detects and returns the current platform for the given runtime.
 *
 * Dynamically loads the platform module based on the runtime's platform check and returns an instance of the platform.
 *
 * @param {IRuntime} runtime - The current runtime instance used to determine the platform.
 * @returns {Promise<IPlatform>} A promise that resolves to an instance of the detected platform.
 * @throws {Error} If the platform is not supported or the dynamic import fails.
 */
export async function currentPlatform(runtime: IRuntime): Promise<IPlatform> {
  // get platform based on runtime check
  const platform = platforms[runtime.platform()];
  const PlatformClass = await platform();
  return new PlatformClass(runtime.spawnCommand);
}
