/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { deepStrictEqual, strictEqual, throws } from 'assert';
import { Terminal } from 'headless/public/Terminal';
import { ITerminalOptions } from '@xterm/headless';

let term: Terminal;

describe('Headless API Tests', function (): void {
  beforeEach(() => {
    // Create default terminal to be used by most tests
    term = new Terminal({ allowProposedApi: true });
  });

  it('Default options', async () => {
    strictEqual(term.cols, 80);
    strictEqual(term.rows, 24);
  });

  it('Proposed API check', async () => {
    term = new Terminal({ allowProposedApi: false });
    throws(() => term.markers, (error: any) => error.message === 'You must set the allowProposedApi option to true to use proposed API');
  });

  it('write', async () => {
    await writeSync('foo');
    await writeSync('bar');
    await writeSync('文');
    lineEquals(0, 'foobar文');
  });

  it('write with callback', async () => {
    let result: string | undefined;
    await new Promise<void>(r => {
      term.write('foo', () => { result = 'a'; });
      term.write('bar', () => { result += 'b'; });
      term.write('文', () => {
        result += 'c';
        r();
      });
    });
    lineEquals(0, 'foobar文');
    strictEqual(result, 'abc');
  });

  it('captures long lines across writes and continues processing queued writes', async () => {
    const chunk = 'x'.repeat(100000);
    strictEqual(await writeResult(term, chunk), '');

    const [result, nextResult] = await Promise.all([
      writeResult(term, `${chunk}\r\n`),
      writeResult(term, 'next\r\n')
    ]);
    strictEqual(result, `${chunk}${chunk}\n`);
    strictEqual(nextResult, 'next\n');
  });

  it('captures Unicode codepoints outside the BMP', async () => {
    strictEqual(await writeResult(term, '中文😀𠮷\r\n'), '中文😀𠮷\n');
  });

  it('keeps captured output isolated between terminals', async () => {
    const other = new Terminal({ allowProposedApi: true });
    try {
      strictEqual(await writeResult(term, 'first-'), '');
      strictEqual(await writeResult(other, 'second\r\n'), 'second\n');
      strictEqual(await writeResult(term, 'done\r\n'), 'first-done\n');
      lineEquals(0, 'first-done');
      strictEqual(other.buffer.active.getLine(0)!.translateToString(true), 'second');
    } finally {
      other.dispose();
    }
  });

  it('keeps capture and visibility isolated during reentrant parsing', async () => {
    const other = new Terminal({ allowProposedApi: true });
    let otherResult: string | undefined;
    const handler = term.parser.registerCsiHandler({ final: 'z' }, () => {
      // Make the other terminal process its next write immediately.
      other.input('x', true);
      other.write('hidden\r\n', (result?: string) => otherResult = result, false);
      return true;
    });
    try {
      strictEqual(await writeResult(term, 'before\x1b[zafter\r\n'), 'beforeafter\n');
      strictEqual(otherResult, 'hidden\n');
      lineEquals(0, 'beforeafter');
      strictEqual(other.buffer.active.getLine(0)!.translateToString(true), '');
    } finally {
      handler.dispose();
      other.dispose();
    }
  });

  describe('hidden output', () => {
    it('does not change the displayed buffer, cursor or modes', async () => {
      await writeSync('visible');
      const before = Array.from({ length: term.buffer.active.length }, (_, i) => term.buffer.active.getLine(i)!.translateToString());
      const modes = term.modes;
      await writeResult(term, '\x1b[3;4H\x1b[3P\x1b[2J\x1b[?1049h\x1b[4h\x1b[?2004hhidden\r\n', false);

      strictEqual(term.buffer.active.type, 'normal');
      strictEqual(term.buffer.active.cursorX, 7);
      strictEqual(term.buffer.active.cursorY, 0);
      deepStrictEqual(term.modes, modes);
      deepStrictEqual(Array.from({ length: term.buffer.active.length }, (_, i) => term.buffer.active.getLine(i)!.translateToString()), before);
    });

    it('does not change displayed text attributes without a callback', async () => {
      term.write('\x1b[31m\x1b[1m', undefined, false);
      await writeSync('X');

      const cell = term.buffer.active.getLine(0)!.getCell(0)!;
      strictEqual(cell.getChars(), 'X');
      strictEqual(cell.isFgDefault(), true);
      strictEqual(cell.isBold(), 0);
    });

    it('does not emit terminal events or invoke registered parser handlers', async () => {
      const events: string[] = [];
      term.onData(() => events.push('data'));
      term.onTitleChange(() => events.push('title'));
      term.onBell(() => events.push('bell'));
      term.onCursorMove(() => events.push('cursor'));
      term.onLineFeed(() => events.push('linefeed'));
      term.onResize(() => events.push('resize'));
      term.onScroll(() => events.push('scroll'));
      term.parser.registerCsiHandler({ final: 'z' }, () => { events.push('csi'); return true; });
      term.parser.registerEscHandler({ final: 'Z' }, () => { events.push('esc'); return true; });
      term.parser.registerOscHandler(777, () => { events.push('osc'); return true; });
      term.parser.registerDcsHandler({ final: 'q' }, () => { events.push('dcs'); return true; });

      const result = await writeResult(term, '\x07\x1b]2;hidden\x07\x1b[6n\x1b[5n\x1b[c\x1bP$qm\x1b\\\x1b[z\x1bZ\x1b]777;value\x07\x1bPqvalue\x1b\\hidden\r\n', false);
      strictEqual(result, 'hidden\n');
      deepStrictEqual(events, []);
    });

    it('keeps hidden text and split escape sequences separate from displayed output', async () => {
      strictEqual(await writeResult(term, 'visible-'), '');
      strictEqual(await writeResult(term, 'hidden-\x1b[', false), '');
      strictEqual(await writeResult(term, 'done\r\n'), 'visible-done\n');
      strictEqual(await writeResult(term, '31mresult\r\n', false), 'hidden-result\n');
      lineEquals(0, 'visible-done');
      lineEquals(1, '');
    });

    it('preserves a displayed escape sequence while processing hidden output', async () => {
      strictEqual(await writeResult(term, 'visible-\x1b['), '');
      strictEqual(await writeResult(term, 'hidden\r\n', false), 'hidden\n');
      strictEqual(await writeResult(term, '31mend\r\n'), 'visible-end\n');
      lineEquals(0, 'visible-end');
      strictEqual(term.buffer.active.getLine(0)!.getCell(8)!.getFgColor(), 1);
    });

    it('preserves split OSC and DCS sequences across hidden writes', async () => {
      strictEqual(await writeResult(term, 'before\x1b]2;unfinished', false), '');
      await writeSync('visible\r\n');
      strictEqual(await writeResult(term, '\x07after\x1bPqpayload\x1b', false), '');
      strictEqual(await writeResult(term, '\\end\r\n', false), 'beforeafterend\n');
      lineEquals(0, 'visible');
    });

    it('keeps split UTF8 sequences separate for hidden and displayed output', async () => {
      strictEqual(await writeResult(term, new Uint8Array([0xf0, 0x9f]), false), '');
      strictEqual(await writeResult(term, new Uint8Array([0xe4, 0xb8])), '');
      strictEqual(await writeResult(term, new Uint8Array([0x98, 0x80, 13, 10]), false), '😀\n');
      strictEqual(await writeResult(term, new Uint8Array([0xad, 13, 10])), '中\n');
      lineEquals(0, '中');
    });

    it('preserves split UTF16 surrogates in hidden output', async () => {
      strictEqual(await writeResult(term, '\ud83d', false), '');
      await writeSync('visible\r\n');
      strictEqual(await writeResult(term, '\ude00\r\n', false), '😀\n');
      lineEquals(0, 'visible');
    });

    it('handles an unpaired surrogate at the hidden decoding buffer boundary', async () => {
      strictEqual(await writeResult(term, '\ud800', false), '');
      const text = 'a'.repeat(4096);
      strictEqual(await writeResult(term, `${text}\r\n`, false), `\ud800${text}\n`);
    });

    it('captures long hidden output without displaying it', async () => {
      const text = 'x'.repeat(200000) + '😀𠮷';
      strictEqual(await writeResult(term, `${text}\r\n`, false), `${text}\n`);
      lineEquals(0, '');
      strictEqual(term.buffer.active.cursorX, 0);
      strictEqual(term.buffer.active.cursorY, 0);
    });

    it('resets hidden capture and escape state with the terminal', async () => {
      strictEqual(await writeResult(term, 'old\x1b]2;unfinished', false), '');
      term.reset();
      strictEqual(await writeResult(term, 'new\r\n', false), 'new\n');
      strictEqual(await writeResult(term, new Uint8Array([0xf0, 0x9f]), false), '');
      strictEqual(await writeResult(term, '\ud83d', false), '');
      term.reset();
      strictEqual(await writeResult(term, new Uint8Array([0xe4, 0xb8, 0xad, 13, 10]), false), '中\n');
      strictEqual(await writeResult(term, 'text\r\n', false), 'text\n');
    });

    it('keeps a hidden full reset isolated from the display', async () => {
      await writeSync('visible');
      strictEqual(await writeResult(term, 'old\x1bcnew\r\n', false), 'new\n');
      lineEquals(0, 'visible');
      strictEqual(term.buffer.active.cursorX, 7);
    });

    it('keeps hidden capture isolated between terminals', async () => {
      const other = new Terminal({ allowProposedApi: true });
      try {
        strictEqual(await writeResult(term, 'first-', false), '');
        strictEqual(await writeResult(other, 'second\r\n', false), 'second\n');
        strictEqual(await writeResult(term, 'done\r\n', false), 'first-done\n');
      } finally {
        other.dispose();
      }
    });

    it('keeps hidden writes behind paused display parsing in the same queue', async () => {
      let resume: (result: boolean) => void;
      const started = new Promise<void>(resolve => {
        term.parser.registerCsiHandler({ final: 'z' }, () => {
          resolve();
          return new Promise<boolean>(r => { resume = r; });
        });
      });
      const callbacks: string[] = [];
      const queue = (label: string, text: string, showOnTerm: boolean): Promise<string> => new Promise(resolve => {
        term.write(text, (result?: string) => {
          callbacks.push(label);
          resolve(result ?? '');
        }, showOnTerm);
      });
      const visible = queue('visible', 'before\x1b[zafter\r\n', true);
      const hidden = queue('hidden', 'hidden\r\n', false);
      const later = queue('later', 'later\r\n', true);
      await started;
      deepStrictEqual(callbacks, []);
      resume!(true);
      deepStrictEqual(await Promise.all([visible, hidden, later]), ['beforeafter\n', 'hidden\n', 'later\n']);
      deepStrictEqual(callbacks, ['visible', 'hidden', 'later']);
      lineEquals(0, 'beforeafter');
      lineEquals(1, 'later');
    });

    it('keeps queued hidden output isolated when writeSync flushes it', async () => {
      term.options.logLevel = 'off';
      const hidden = writeResult(term, 'hidden\r\n', false);
      (term as any)._core.writeSync('visible\r\n');
      strictEqual(await hidden, 'hidden\n');
      lineEquals(0, 'visible');
      lineEquals(1, '');
      strictEqual(await writeResult(term, 'next\r\n', false), 'next\n');
    });
  });

  it('write - bytes (UTF8)', async () => {
    await writeSync(new Uint8Array([102, 111, 111])); // foo
    await writeSync(new Uint8Array([98, 97, 114])); // bar
    await writeSync(new Uint8Array([230, 150, 135])); // 文
    lineEquals(0, 'foobar文');
  });

  it('write - bytes (UTF8) with callback', async () => {
    let result: string | undefined;
    await new Promise<void>(r => {
      term.write(new Uint8Array([102, 111, 111]), () => { result = 'A'; }); // foo
      term.write(new Uint8Array([98, 97, 114]), () => { result += 'B'; }); // bar
      term.write(new Uint8Array([230, 150, 135]), () => { // 文
        result += 'C';
        r();
      });
    });
    lineEquals(0, 'foobar文');
    strictEqual(result, 'ABC');
  });

  it('writeln', async () => {
    await writelnSync('foo');
    await writelnSync('bar');
    await writelnSync('文');
    lineEquals(0, 'foo');
    lineEquals(1, 'bar');
    lineEquals(2, '文');
  });

  it('writeln with callback', async () => {
    let result: string | undefined;
    await new Promise<void>(r => {
      term.writeln('foo', () => { result = '1'; });
      term.writeln('bar', () => { result += '2'; });
      term.writeln('文', () => {
        result += '3';
        r();
      });
    });
    lineEquals(0, 'foo');
    lineEquals(1, 'bar');
    lineEquals(2, '文');
    strictEqual(result, '123');
  });

  it('writeln - bytes (UTF8)', async () => {
    await writelnSync(new Uint8Array([102, 111, 111]));
    await writelnSync(new Uint8Array([98, 97, 114]));
    await writelnSync(new Uint8Array([230, 150, 135]));
    lineEquals(0, 'foo');
    lineEquals(1, 'bar');
    lineEquals(2, '文');
  });

  it('clear', async () => {
    term = new Terminal({ rows: 5, allowProposedApi: true });
    for (let i = 0; i < 10; i++) {
      await writeSync('\n\rtest' + i);
    }
    term.clear();
    strictEqual(term.buffer.active.length, 5);
    lineEquals(0, 'test9');
    for (let i = 1; i < 5; i++) {
      lineEquals(i, '');
    }
  });

  describe('options', () => {
    const termOptions = {
      cols: 80,
      rows: 24
    };

    beforeEach(async () => {
      term = new Terminal(termOptions);
    });
    it('get options', () => {
      const options: ITerminalOptions = term.options;
      strictEqual(options.lineHeight, 1);
      strictEqual(options.cursorWidth, 1);
    });
    it('set options', async () => {
      term.options.scrollback = 1;
      strictEqual(term.options.scrollback, 1);
      term.options= {
        fontSize: 12,
        fontFamily: 'Arial'
      };
      strictEqual(term.options.fontSize, 12);
      strictEqual(term.options.fontFamily, 'Arial');
    });
  });


  describe('loadAddon', () => {
    it('constructor', async () => {
      term = new Terminal({ cols: 5 });
      let cols = 0;
      term.loadAddon({
        activate: (t) => cols = t.cols,
        dispose: () => { }
      });
      strictEqual(cols, 5);
    });

    it('dispose (addon)', async () => {
      let disposeCalled = false;
      const addon = {
        activate: () => { },
        dispose: () => disposeCalled = true
      };
      term.loadAddon(addon);
      strictEqual(disposeCalled, false);
      addon.dispose();
      strictEqual(disposeCalled, true);
    });

    it('dispose (terminal)', async () => {
      let disposeCalled = false;
      term.loadAddon({
        activate: () => { },
        dispose: () => disposeCalled = true
      });
      strictEqual(disposeCalled, false);
      term.dispose();
      strictEqual(disposeCalled, true);
    });
  });

  describe('Events', () => {
    it('onCursorMove', async () => {
      let callCount = 0;
      term.onCursorMove(e => callCount++);
      await writeSync('foo');
      strictEqual(callCount, 1);
      await writeSync('bar');
      strictEqual(callCount, 2);
    });

    it('onData', async () => {
      const calls: string[] = [];
      term.onData(e => calls.push(e));
      await writeSync('\x1b[5n'); // DSR Status Report
      deepStrictEqual(calls, ['\x1b[0n']);
    });

    it('onLineFeed', async () => {
      let callCount = 0;
      term.onLineFeed(() => callCount++);
      await writelnSync('foo');
      strictEqual(callCount, 1);
      await writelnSync('bar');
      strictEqual(callCount, 2);
    });

    it('onScroll', async () => {
      term = new Terminal({ rows: 5 });
      const calls: number[] = [];
      term.onScroll(e => calls.push(e));
      for (let i = 0; i < 4; i++) {
        await writelnSync('foo');
      }
      deepStrictEqual(calls, []);
      await writelnSync('bar');
      deepStrictEqual(calls, [1]);
      await writelnSync('baz');
      deepStrictEqual(calls, [1, 2]);
    });

    it('onResize', async () => {
      const calls: [number, number][] = [];
      term.onResize(e => calls.push([e.cols, e.rows]));
      deepStrictEqual(calls, []);
      term.resize(10, 5);
      deepStrictEqual(calls, [[10, 5]]);
      term.resize(20, 15);
      deepStrictEqual(calls, [[10, 5], [20, 15]]);
    });

    it('onTitleChange', async () => {
      const calls: string[] = [];
      term.onTitleChange(e => calls.push(e));
      deepStrictEqual(calls, []);
      await writeSync('\x1b]2;foo\x9c');
      deepStrictEqual(calls, ['foo']);
    });

    it('onBell', async () => {
      const calls: boolean[] = [];
      term.onBell(() => calls.push(true));
      deepStrictEqual(calls, []);
      await writeSync('\x07');
      deepStrictEqual(calls, [true]);
    });
  });

  describe('buffer', () => {
    it('cursorX, cursorY', async () => {
      term = new Terminal({ rows: 5, cols: 5, allowProposedApi: true });
      strictEqual(term.buffer.active.cursorX, 0);
      strictEqual(term.buffer.active.cursorY, 0);
      await writeSync('foo');
      strictEqual(term.buffer.active.cursorX, 3);
      strictEqual(term.buffer.active.cursorY, 0);
      await writeSync('\n');
      strictEqual(term.buffer.active.cursorX, 3);
      strictEqual(term.buffer.active.cursorY, 1);
      await writeSync('\r');
      strictEqual(term.buffer.active.cursorX, 0);
      strictEqual(term.buffer.active.cursorY, 1);
      await writeSync('abcde');
      strictEqual(term.buffer.active.cursorX, 5);
      strictEqual(term.buffer.active.cursorY, 1);
      await writeSync('\n\r\n\n\n\n\n');
      strictEqual(term.buffer.active.cursorX, 0);
      strictEqual(term.buffer.active.cursorY, 4);
    });

    it('viewportY', async () => {
      term = new Terminal({ rows: 5, allowProposedApi: true });
      strictEqual(term.buffer.active.viewportY, 0);
      await writeSync('\n\n\n\n');
      strictEqual(term.buffer.active.viewportY, 0);
      await writeSync('\n');
      strictEqual(term.buffer.active.viewportY, 1);
      await writeSync('\n\n\n\n');
      strictEqual(term.buffer.active.viewportY, 5);
      term.scrollLines(-1);
      strictEqual(term.buffer.active.viewportY, 4);
      term.scrollToTop();
      strictEqual(term.buffer.active.viewportY, 0);
    });

    it('baseY', async () => {
      term = new Terminal({ rows: 5, allowProposedApi: true });
      strictEqual(term.buffer.active.baseY, 0);
      await writeSync('\n\n\n\n');
      strictEqual(term.buffer.active.baseY, 0);
      await writeSync('\n');
      strictEqual(term.buffer.active.baseY, 1);
      await writeSync('\n\n\n\n');
      strictEqual(term.buffer.active.baseY, 5);
      term.scrollLines(-1);
      strictEqual(term.buffer.active.baseY, 5);
      term.scrollToTop();
      strictEqual(term.buffer.active.baseY, 5);
    });

    it('length', async () => {
      term = new Terminal({ rows: 5, allowProposedApi: true });
      strictEqual(term.buffer.active.length, 5);
      await writeSync('\n\n\n\n');
      strictEqual(term.buffer.active.length, 5);
      await writeSync('\n');
      strictEqual(term.buffer.active.length, 6);
      await writeSync('\n\n\n\n');
      strictEqual(term.buffer.active.length, 10);
    });

    describe('getLine', () => {
      it('invalid index', async () => {
        term = new Terminal({ rows: 5, allowProposedApi: true });
        strictEqual(term.buffer.active.getLine(-1), undefined);
        strictEqual(term.buffer.active.getLine(5), undefined);
      });

      it('isWrapped', async () => {
        term = new Terminal({ cols: 5, allowProposedApi: true });
        strictEqual(term.buffer.active.getLine(0)!.isWrapped, false);
        strictEqual(term.buffer.active.getLine(1)!.isWrapped, false);
        await writeSync('abcde');
        strictEqual(term.buffer.active.getLine(0)!.isWrapped, false);
        strictEqual(term.buffer.active.getLine(1)!.isWrapped, false);
        await writeSync('f');
        strictEqual(term.buffer.active.getLine(0)!.isWrapped, false);
        strictEqual(term.buffer.active.getLine(1)!.isWrapped, true);
      });

      it('translateToString', async () => {
        term = new Terminal({ cols: 5, allowProposedApi: true });
        strictEqual(term.buffer.active.getLine(0)!.translateToString(), '     ');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(true), '');
        await writeSync('foo');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(), 'foo  ');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(true), 'foo');
        await writeSync('bar');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(), 'fooba');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(true), 'fooba');
        strictEqual(term.buffer.active.getLine(1)!.translateToString(true), 'r');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(false, 1), 'ooba');
        strictEqual(term.buffer.active.getLine(0)!.translateToString(false, 1, 3), 'oo');
      });

      it('getCell', async () => {
        term = new Terminal({ cols: 5, allowProposedApi: true });
        strictEqual(term.buffer.active.getLine(0)!.getCell(-1), undefined);
        strictEqual(term.buffer.active.getLine(0)!.getCell(5), undefined);
        strictEqual(term.buffer.active.getLine(0)!.getCell(0)!.getChars(), '');
        strictEqual(term.buffer.active.getLine(0)!.getCell(0)!.getWidth(), 1);
        await writeSync('a文');
        strictEqual(term.buffer.active.getLine(0)!.getCell(0)!.getChars(), 'a');
        strictEqual(term.buffer.active.getLine(0)!.getCell(0)!.getWidth(), 1);
        strictEqual(term.buffer.active.getLine(0)!.getCell(1)!.getChars(), '文');
        strictEqual(term.buffer.active.getLine(0)!.getCell(1)!.getWidth(), 2);
        strictEqual(term.buffer.active.getLine(0)!.getCell(2)!.getChars(), '');
        strictEqual(term.buffer.active.getLine(0)!.getCell(2)!.getWidth(), 0);
      });
    });

    it('active, normal, alternate', async () => {
      term = new Terminal({ cols: 5, allowProposedApi: true });
      strictEqual(term.buffer.active.type, 'normal');
      strictEqual(term.buffer.normal.type, 'normal');
      strictEqual(term.buffer.alternate.type, 'alternate');

      await writeSync('norm ');
      strictEqual(term.buffer.active.getLine(0)!.translateToString(), 'norm ');
      strictEqual(term.buffer.normal.getLine(0)!.translateToString(), 'norm ');
      strictEqual(term.buffer.alternate.getLine(0), undefined);

      await writeSync('\x1b[?47h\r'); // use alternate screen buffer
      strictEqual(term.buffer.active.type, 'alternate');
      strictEqual(term.buffer.normal.type, 'normal');
      strictEqual(term.buffer.alternate.type, 'alternate');

      strictEqual(term.buffer.active.getLine(0)!.translateToString(), '     ');
      await writeSync('alt  ');
      strictEqual(term.buffer.active.getLine(0)!.translateToString(), 'alt  ');
      strictEqual(term.buffer.normal.getLine(0)!.translateToString(), 'norm ');
      strictEqual(term.buffer.alternate.getLine(0)!.translateToString(), 'alt  ');

      await writeSync('\x1b[?47l\r'); // use normal screen buffer
      strictEqual(term.buffer.active.type, 'normal');
      strictEqual(term.buffer.normal.type, 'normal');
      strictEqual(term.buffer.alternate.type, 'alternate');

      strictEqual(term.buffer.active.getLine(0)!.translateToString(), 'norm ');
      strictEqual(term.buffer.normal.getLine(0)!.translateToString(), 'norm ');
      strictEqual(term.buffer.alternate.getLine(0), undefined);
    });
  });

  describe('modes', () => {
    it('defaults', () => {
      deepStrictEqual(term.modes, {
        applicationCursorKeysMode: false,
        applicationKeypadMode: false,
        bracketedPasteMode: false,
        insertMode: false,
        mouseTrackingMode: 'none',
        originMode: false,
        reverseWraparoundMode: false,
        sendFocusMode: false,
        wraparoundMode: true
      });
    });
    it('applicationCursorKeysMode', async () => {
      await writeSync('\x1b[?1h');
      strictEqual(term.modes.applicationCursorKeysMode, true);
      await writeSync('\x1b[?1l');
      strictEqual(term.modes.applicationCursorKeysMode, false);
    });
    it('applicationKeypadMode', async () => {
      await writeSync('\x1b[?66h');
      strictEqual(term.modes.applicationKeypadMode, true);
      await writeSync('\x1b[?66l');
      strictEqual(term.modes.applicationKeypadMode, false);
    });
    it('bracketedPasteMode', async () => {
      await writeSync('\x1b[?2004h');
      strictEqual(term.modes.bracketedPasteMode, true);
      await writeSync('\x1b[?2004l');
      strictEqual(term.modes.bracketedPasteMode, false);
    });
    it('insertMode', async () => {
      await writeSync('\x1b[4h');
      strictEqual(term.modes.insertMode, true);
      await writeSync('\x1b[4l');
      strictEqual(term.modes.insertMode, false);
    });
    it('mouseTrackingMode', async () => {
      await writeSync('\x1b[?9h');
      strictEqual(term.modes.mouseTrackingMode, 'x10');
      await writeSync('\x1b[?9l');
      strictEqual(term.modes.mouseTrackingMode, 'none');
      await writeSync('\x1b[?1000h');
      strictEqual(term.modes.mouseTrackingMode, 'vt200');
      await writeSync('\x1b[?1000l');
      strictEqual(term.modes.mouseTrackingMode, 'none');
      await writeSync('\x1b[?1002h');
      strictEqual(term.modes.mouseTrackingMode, 'drag');
      await writeSync('\x1b[?1002l');
      strictEqual(term.modes.mouseTrackingMode, 'none');
      await writeSync('\x1b[?1003h');
      strictEqual(term.modes.mouseTrackingMode, 'any');
      await writeSync('\x1b[?1003l');
      strictEqual(term.modes.mouseTrackingMode, 'none');
    });
    it('originMode', async () => {
      await writeSync('\x1b[?6h');
      strictEqual(term.modes.originMode, true);
      await writeSync('\x1b[?6l');
      strictEqual(term.modes.originMode, false);
    });
    it('reverseWraparoundMode', async () => {
      await writeSync('\x1b[?45h');
      strictEqual(term.modes.reverseWraparoundMode, true);
      await writeSync('\x1b[?45l');
      strictEqual(term.modes.reverseWraparoundMode, false);
    });
    it('sendFocusMode', async () => {
      await writeSync('\x1b[?1004h');
      strictEqual(term.modes.sendFocusMode, true);
      await writeSync('\x1b[?1004l');
      strictEqual(term.modes.sendFocusMode, false);
    });
    it('wraparoundMode', async () => {
      await writeSync('\x1b[?7h');
      strictEqual(term.modes.wraparoundMode, true);
      await writeSync('\x1b[?7l');
      strictEqual(term.modes.wraparoundMode, false);
    });
  });

  it('dispose', async () => {
    term.dispose();
    strictEqual((term as any)._core._isDisposed, true);
  });
});

function writeSync(text: string | Uint8Array): Promise<void> {
  return new Promise<void>(r => term.write(text, r));
}

function writeResult(terminal: Terminal, text: string | Uint8Array, showOnTerm: boolean = true): Promise<string> {
  return new Promise<string>(resolve => terminal.write(text, (result?: string) => resolve(result ?? ''), showOnTerm));
}

function writelnSync(text: string | Uint8Array): Promise<void> {
  return new Promise<void>(r => term.writeln(text, r));
}

function lineEquals(index: number, text: string): void {
  strictEqual(term.buffer.active.getLine(index)!.translateToString(true), text);
}
