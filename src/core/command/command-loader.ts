import glob from 'glob';
import path from 'path';
import { Command } from './command';

export class CommandLoader {
  private static instance: CommandLoader;
  private readonly commandsDirPath: string;
  private filenames: string[] = [];
  private promises: Promise<Command>[] = [];
  private instances: Command[] = [];
  
  private constructor() {
    this.commandsDirPath = path.resolve(__dirname, '../../commands');
  }
  
  static getInstance(): CommandLoader {
    if (!this.instance)
      this.instance = new CommandLoader();
    return this.instance;
  }
  
  getAll(): Command[] {
    return this.instances;
  }

  async load(): Promise<void> {
    this.searchCommandFilenames();
    this.importCommandsPromises();
    await this.resolveCommandsPromises();
  }
  
  private searchCommandFilenames(): void {
    this.filenames = glob.sync(`${this.commandsDirPath}/[!_]*.{js,ts}`);
  }
  
  private importCommandsPromises(): void {
    for (const filename of this.filenames)
      this.importCommandPromise(filename);
  }
  
  private importCommandPromise(filename: string): void {
    const path = this.getPathToCommandFile(filename);
    const cmdPromise = import(path).then(m => m.default);
    this.promises.push(cmdPromise);
  }
  
  private getPathToCommandFile(filename: string): string {
    return path.resolve(this.commandsDirPath, filename);
  }
  
  private async resolveCommandsPromises(): Promise<void> {
    this.instances = await Promise.all(this.promises);
  }
}