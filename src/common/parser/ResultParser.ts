import { Params } from "./Params";

class LineBuffer {
  private buffer: Uint32Array;
  private size: number = 0;

  constructor() {
    this.buffer = new Uint32Array(32);
  }

  public setData(codeArray: Uint32Array, pos: number) {
    if (this.buffer.length <= pos + codeArray.length) {
      const newArray = new Uint32Array((pos + codeArray.length) * 2);
      newArray.set(this.buffer);
      this.buffer = newArray;
    }
    let writePos = pos;
    for (let i = 0; i < codeArray.length; i++) {
      this.buffer[writePos++] = codeArray[i];
    }
    this.size = Math.max(this.size, pos + codeArray.length);
  }

  public toString() {
    return String.fromCharCode(...this.buffer.slice(0, this.size));
  }

  public eraseInBufferLine(start: number, end: number) {
    if (start < 0) {
      start = 0;
    }
    if (end < 0) {
      end = this.size;
    }
    while (start < end) {
      // replace with space
      this.buffer[start] = 32;
      start++;
    }
  }
}

class ResultParser {
  private buffers: LineBuffer[] = [];
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
      this.buffers.push(new LineBuffer());
    }
    const bufferLine = this.buffers[this.line];
    bufferLine.setData(codeArray, this.col);
    this.col += codeArray.length;
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
    let strings: string[] = [];
    for (let i = 0; i < this.buffers.length; i++) {
      const line = this.buffers[i];
      if (!line) {
        this.clear();
        return strings.join("\n");
      }
      let lineStr = line.toString();
      if (i === 0) {
        for (let j = 0; j < 10; j++) {
          if (lineStr.charCodeAt(j) === 0) {
            let k = j;
            while (lineStr.charCodeAt(k) === 0) {
              k++;
            }
            lineStr = lineStr.substring(k);
            break;
          }
        }
      }
      strings.push(lineStr);
    }
    this.clear();
    return strings.join("\n");
  }
}

export default new ResultParser();
