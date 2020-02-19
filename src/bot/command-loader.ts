import fs from 'fs';
import path from 'path';
import { Command } from './command';

interface Loader<T> {
  get(): T[];
  load(): void;
}

export class CommandLoader implements Loader<Command> {
  private readonly commandsDirPath: string;
  private commandsFilenames: string[] = [];
  private promiseCommands: Promise<Command>[] = [];
  private commands: Command[] = [];

  constructor() {
    this.commandsDirPath = path.resolve(__dirname, '..', 'commands');
  }

  public get(): Command[] {
    return this.commands;
  }

  public async load() {
    this.parseFilenamesInDir();
    this.loadPromisesFromDir();
    await this.resolvePromises();
  }

  private loadPromisesFromDir() {
    for (const filename of this.commandsFilenames)
      this.loadAndAddPromise(filename);
  }

  private loadAndAddPromise(filename: string) {
    const pathToFile = this.getPathToFile(filename);
    const command = import(pathToFile);
    this.promiseCommands.push(command);
  }

  private getPathToFile(filename: string) {
    return path.resolve(this.commandsDirPath, filename);
  }

  private parseFilenamesInDir() {
    this.commandsFilenames = fs.readdirSync(this.commandsDirPath);
  }

  private async resolvePromises() {
    this.commands = await Promise.all(this.promiseCommands);
  }
}
