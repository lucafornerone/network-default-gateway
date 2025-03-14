import { platformFromRuntimeOs } from '../common.ts';
import { IRuntime, Platform, Runtime } from '../types.ts';
import { platform } from 'node:os';
import { Buffer } from 'node:buffer';

export class BunRuntime implements IRuntime {
  /**
   * Spawns a command in the Bun runtime and returns its standard output as a string.
   *
   * @param {string[]} cmds - The command and its arguments to execute.
   * @param {string} [processInput] - Optional input to pass to the process's stdin.
   * @returns {Promise<string>} A promise that resolves to the trimmed standard output of the command.
   * @throws {Error} If the command execution fails.
   */
  async spawnCommand(cmds: string[], processInput?: string): Promise<string> {
    // spawn command with input if exists
    const process = Bun.spawn(cmds, {
      stdin: processInput ? Buffer.from(processInput) : undefined,
    });
    return (await new Response(process.stdout).text()).trim();
  }

  /**
   * Determines and returns the current platform for the Bun runtime.
   *
   * @returns {Platform} The detected platform corresponding to the Bun runtime.
   * @throws {PlatformNotSupportedError} If the platform is not supported.
   */
  platform(): Platform {
    return platformFromRuntimeOs(Runtime.Bun, platform());
  }
}
