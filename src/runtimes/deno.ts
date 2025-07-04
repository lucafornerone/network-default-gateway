import { platformFromRuntimeOs } from '../common.ts';
import { IRuntime, Platform, Runtime } from '../types.ts';

export class DenoRuntime implements IRuntime {
  /**
   * Spawns a command in the Deno runtime and returns its standard output as a string.
   *
   * @param {string[]} cmds - The command and its arguments to execute. The first element is the command, and the rest are arguments.
   * @param {string} [processInput] - Optional input to pass to the process's stdin (currently not handled in this snippet).
   * @returns {Promise<string>} A promise that resolves to the trimmed standard output of the command.
   * @throws {Error} If the command execution fails.
   */
  async spawnCommand(cmds: string[], processInput?: string): Promise<string> {
    // command args are cmds strings starting from second position
    const options: Deno.CommandOptions = {
      args: cmds.slice(1),
    };
    // command is first cmds string
    const command = new Deno.Command(cmds[0], options);

    // prepare text decoder for output
    const textDecoder = new TextDecoder();

    if (!processInput) {
      // execute command without input
      const { stdout } = await command.output();
      return textDecoder.decode(stdout).trim();
    }

    // attach process input to current command
    options.stdin = 'piped';
    options.stdout = 'piped';
    const process: Deno.ChildProcess = command.spawn();
    const inputBytes: Uint8Array = new TextEncoder().encode(processInput);
    const writer = process.stdin.getWriter();
    await writer.write(inputBytes);
    // release and close input
    writer.releaseLock();
    process.stdin.close();

    const { stdout } = await process.output();
    return textDecoder.decode(stdout).trim();
  }

  /**
   * Determines and returns the current platform for the Deno runtime.
   *
   * @returns {Platform} The detected platform corresponding to the Deno runtime.
   * @throws {PlatformNotSupportedError} If the platform is not supported.
   */
  platform(): Platform {
    return platformFromRuntimeOs(Runtime.Deno, Deno.build.os);
  }
}
