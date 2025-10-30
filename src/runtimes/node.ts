import { spawn, spawnSync } from 'node:child_process';
import { platform } from 'node:os';
import { platformFromRuntimeOs } from '../common.ts';
import { IRuntime, Platform, Runtime } from '../types.ts';

export class NodeRuntime implements IRuntime {
  /**
   * Spawns a command in the Node.js runtime and returns its standard output as a string.
   *
   * @param {string[]} cmds - The command and its arguments to execute. The first element is the command, and the rest are arguments.
   * @param {string} [processInput] - Optional input to pass to the process's stdin.
   * @returns {Promise<string>} A promise that resolves to the trimmed standard output of the command.
   * @throws {Error} If the command execution fails.
   */
  async spawnCommand(cmds: string[], processInput?: string): Promise<string> {
    if (!processInput) {
      // execute command without input
      return spawnSync(cmds[0], cmds.slice(1)).stdout.toString().trim();
    }

    return await new Promise((resolve) => {
      const process = spawn(cmds[0], cmds.slice(1));
      if (processInput) {
        // attach process input to current command
        process.stdin.write(processInput);
        process.stdin.end();
      }

      let output = '';
      process.stdout.on('data', (data) => {
        // concat output
        output += data.toString();
      });

      process.on('error', () => {
        throw new NodeParsingCommandError();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          throw new NodeParsingCommandError();
        }
        // command correctly executed
        resolve(output.trim());
      });
    });
  }

  /**
   * Determines and returns the current platform for the Node.js runtime.
   *
   * @returns {Platform} The detected platform corresponding to the Node.js runtime.
   * @throws {PlatformNotSupportedError} If the platform is not supported.
   */
  platform(): Platform {
    return platformFromRuntimeOs(Runtime.Node, platform());
  }
}

class NodeParsingCommandError extends Error {
  constructor() {
    super('Error while parsing node command');
    this.name = 'NodeParsingCommandError';
  }
}
