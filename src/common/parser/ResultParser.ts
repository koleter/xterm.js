import { Params } from "./Params";


class ResultParser {
  private buffers: Uint32Array[] = [];
  private line: number = 0;
  private col: number = 0;
  public _params: Params;
  public shouldParse: boolean | undefined = false;
  public _collect: number = 0;
  public showOnTerm: boolean = true;

  constructor() {
    this._params = new Params(); // defaults to 32 storable params/subparams
    this._params.addParam(0);    // ZDM
  }

  public clear() {
    this.col = 0;
    this.line = 0;
    this.buffers = [];
  }

  public print(codeArray: Uint32Array) {
    if (!this.shouldParse) {
      return;
    }
    while (this.buffers.length <= this.line) {
      this.buffers.push(new Uint32Array(32));
    }
    let bufferLine = this.buffers[this.line];
    if (bufferLine.length <= this.col + codeArray.length) {
      const newArray = new Uint32Array((this.col + codeArray.length) * 2);
      newArray.set(bufferLine);
      this.buffers[this.line] = newArray;
      bufferLine = newArray;
    }
    for (let i = 0; i < codeArray.length; i++) {
      bufferLine[this.col] = codeArray[i];
      this.col++;
    }
  }

  public setCol(col: number) {
    if (!this.shouldParse) {
      return;
    }
    if (col < 0) {
      col = 0;
    }
    this.col = col;
  }

  public getCol(): number {
    return this.col;
  }

  public setLine(line: number) {
    if (!this.shouldParse) {
      return;
    }
    if (line < 0) {
      line = 0;
    }
    this.line = line;
  }

  public getLine(): number {
    return this.line;
  }

  public moveCursor(col: number, line: number) {
    if (!this.shouldParse) {
      return;
    }
    this.setCursor(this.col + col, this.line  + line);
  }

  public setCursor(col: number, line: number) {
    if (!this.shouldParse) {
      return;
    }
    this.setCol(col);
    this.setLine(line);
  }

  public eraseInBufferLine(start: number, end: number) {
    if (!this.shouldParse) {
      return;
    }
    const buffer = this.buffers[this.line];
    if (!buffer) {
      return;
    }
    if (start < 0) {
      start = 0;
    }
    if (end < 0) {
      end = buffer.length;
    }
    while (start < end && start < buffer.length) {
      // replace with space
      buffer[start] = 32;
      start++;
    }
  }

  public eraseUntilEndBufferLine() {
    if (!this.shouldParse) {
      return;
    }
    this.buffers = this.buffers.slice(0, this.line + 1);
  }

  public getResult(): string {
    if (!this.shouldParse) {
      return "";
    }
    let strings: string[] = [];
    for (let i = 0; i < this.line; i++) {
      const line = this.buffers[i];
      if (!line) {
        this.clear();
        return strings.join("\n");
      }
      strings.push(String.fromCharCode(...line));
    }
    this.clear();
    return strings.join("\n");
  }
}

export default new ResultParser();
