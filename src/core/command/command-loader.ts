import glob from 'glob';
import path from 'path';
import { Command } from './command';

export class CommandLoader {
  private readonly commandsDirPath: string;
  private filenames: string[] = [];
  private promises: Promise<Command>[] = [];
  private instances: Command[] = [];
  
  constructor() {
    this.commandsDirPath = path.resolve(__dirname, '../../commands');
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
    this.filenames = glob.sync(`${this.commandsDirPath}/*.js`);
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