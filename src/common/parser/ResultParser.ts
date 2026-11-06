import { utf32ToString } from 'common/input/TextDecoder';
import { Params } from "./Params";

class LineBuffer {
  private buffer: Uint32Array;
  private size: number = 0;

  constructor() {
    this.buffer = new Uint32Array(32);
  }

  public setData(codeArray: Uint32Array, pos: number): void {
    if (this.buffer.length < pos + codeArray.length) {
      const newArray = new Uint32Array((pos + codeArray.length) * 2);
      newArray.set(this.buffer);
      this.buffer = newArray;
    }
    if (pos > this.size) {
      this.buffer.fill(32, this.size, pos);
    }
    this.buffer.set(codeArray, pos);
    this.size = Math.max(this.size, pos + codeArray.length);
  }

  public toString(): string {
    return utf32ToString(this.buffer, 0, this.size);
  }

  public eraseInBufferLine(start: number, end: number) {
    if (start < 0) {
      start = 0;
    }
    end = end < 0 ? this.size : Math.min(end, this.size);
    while (start < end) {
      // replace with space
      this.buffer[start] = 32;
      start++;
    }
  }
}

export class ResultParser {
  private buffers: LineBuffer[] = [];
  private line: number = 0;
  private col: number = 0;
  public _params: Params;
  // True if there is a callback function
  public shouldParse: boolean | undefined = false;
  // True if input has '\n'
  public shouldPrint: boolean | undefined = false;
  public _collect: number = 0;

  constructor() {
    this._params = new Params(); // defaults to 32 storable params/subparams
    this._params.addParam(0);    // ZDM
  }

  public clear() {
    this.col = 0;
    this.line = 0;
    this.buffers = [];
    this.shouldPrint = false;
  }

  public lineFeed(): void {
    if (!this.shouldParse) {
      return;
    }
    this.line++;
    // Capture text lines independently of the display cursor's VT line feed behavior.
    this.col = 0;
    this.shouldPrint = true;
    this._getBufferLine();
  }

  public print(codeArray: Uint32Array) {
    if (!this.shouldParse) {
      return;
    }
    if (codeArray.length === 0) {
      return;
    }
    const bufferLine = this._getBufferLine();
    bufferLine.setData(codeArray, this.col);
    this.col += codeArray.length;
  }

  private _getBufferLine(): LineBuffer {
    while (this.buffers.length <= this.line) {
      this.buffers.push(new LineBuffer());
    }
    return this.buffers[this.line];
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
    buffer.eraseInBufferLine(start, end);
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
    if (!this.shouldPrint) {
      return "";
    }
    const result = this.buffers.map(line => line.toString()).join('\n');
    this.clear();
    return result;
  }
}
