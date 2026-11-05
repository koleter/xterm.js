/**
 * Copyright (c) 2026 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { C0 } from 'common/data/EscapeSequences';
import { StringToUtf32, Utf8ToUtf32 } from 'common/input/TextDecoder';
import { Disposable } from 'common/Lifecycle';
import { EscapeSequenceParser } from 'common/parser/EscapeSequenceParser';
import { IParams } from 'common/parser/Types';

const INPUT_CHUNK_LENGTH = 4096;
const LINE_FEED = new Uint32Array([10]);

/**
 * Captures hidden output without access to terminal buffers, services or event handlers.
 * Only the controls used by text capture are handled; terminal side effects are ignored.
 */
export class OutputParser extends Disposable {
  private readonly _parser = this.register(new EscapeSequenceParser());
  private readonly _stringDecoder = new StringToUtf32();
  private readonly _utf8Decoder = new Utf8ToUtf32();
  // A pending, unpaired high surrogate can produce one extra codepoint on the next decode.
  private readonly _parseBuffer = new Uint32Array(INPUT_CHUNK_LENGTH + 1);

  constructor() {
    super();
    const result = this._parser.resultParser;
    for (const code of [C0.LF, C0.VT, C0.FF]) {
      this._parser.setExecuteHandler(code, () => {
        result.moveCursor(0, 1);
        result.shouldPrint = true;
        result.print(LINE_FEED);
        return true;
      });
    }
    this._parser.setExecuteHandler(C0.CR, () => { result.setCol(0); return true; });
    this._parser.setExecuteHandler(C0.BS, () => { result.moveCursor(-1, 0); return true; });
    this._parser.registerCsiHandler({ final: 'A' }, params => {
      result.moveCursor(0, -(params.params[0] || 1));
      return true;
    });
    this._parser.registerCsiHandler({ final: 'B' }, params => {
      result.moveCursor(0, params.params[0] || 1);
      return true;
    });
    this._parser.registerCsiHandler({ final: 'C' }, params => {
      result.moveCursor(params.params[0] || 1, 0);
      return true;
    });
    this._parser.registerCsiHandler({ final: 'D' }, params => {
      result.moveCursor(-(params.params[0] || 1), 0);
      return true;
    });
    this._parser.registerCsiHandler({ final: 'E' }, params => {
      result.moveCursor(0, params.params[0] || 1);
      result.setCol(0);
      return true;
    });
    this._parser.registerCsiHandler({ final: 'F' }, params => {
      result.moveCursor(0, -(params.params[0] || 1));
      result.setCol(0);
      return true;
    });
    for (const prefix of [undefined, '?']) {
      this._parser.registerCsiHandler({ prefix, final: 'J' }, params => {
        if (params.params[0] === 0) {
          result.eraseInBufferLine(result.getCol(), -1);
          result.eraseUntilEndBufferLine();
        }
        return true;
      });
      this._parser.registerCsiHandler({ prefix, final: 'K' }, params => this._eraseInLine(params));
    }
    this._parser.registerEscHandler({ final: 'c' }, () => {
      result.clear();
      result.shouldPrint = false;
      return true;
    });
  }

  public parse(data: string | Uint8Array, hasCallback: boolean = false): void {
    this._parser.resultParser.shouldParse = hasCallback;
    for (let start = 0; start < data.length; start += INPUT_CHUNK_LENGTH) {
      const end = Math.min(start + INPUT_CHUNK_LENGTH, data.length);
      const length = typeof data === 'string'
        ? this._stringDecoder.decode(data.substring(start, end), this._parseBuffer)
        : this._utf8Decoder.decode(data.subarray(start, end), this._parseBuffer);
      // This parser only has synchronous, private handlers.
      this._parser.parse(this._parseBuffer, length, undefined, hasCallback);
    }
  }

  public getResult(): string {
    return this._parser.resultParser.getResult();
  }

  public reset(): void {
    this._parser.reset();
    this._stringDecoder.clear();
    this._utf8Decoder.clear();
    this._parser.resultParser.clear();
    this._parser.resultParser.shouldParse = false;
    this._parser.resultParser.shouldPrint = false;
  }

  public dispose(): void {
    this.reset();
    super.dispose();
  }

  private _eraseInLine(params: IParams): boolean {
    const result = this._parser.resultParser;
    switch (params.params[0]) {
      case 0:
        result.eraseInBufferLine(result.getCol(), -1);
        break;
      case 1:
        result.eraseInBufferLine(0, result.getCol() + 1);
        break;
      case 2:
        result.eraseInBufferLine(0, -1);
        break;
    }
    return true;
  }
}
