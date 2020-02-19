export class Logger {
  constructor(private readonly prefix: string) { }

  public log(str: string): void {
    console.log(`[${this.prefix}] ${str}`);
  }
}
