/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { assert } from 'chai';
import { WriteBuffer } from './WriteBuffer';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare let Buffer: any;

function toBytes(s: string): Uint8Array {
  return Buffer.from(s);
}

function fromBytes(bytes: Uint8Array): string {
  return bytes.toString();
}

describe('WriteBuffer', () => {
  let wb: WriteBuffer;
  let stack: (string | Uint8Array)[] = [];
  let cbStack: string[] = [];
  beforeEach(() => {
    stack = [];
    cbStack = [];
    wb = new WriteBuffer(data => { stack.push(data); });
  });
  describe('write input', () => {
    it('string', done => {
      wb.write('a._');
      wb.write('b.x', () => { cbStack.push('b'); });
      wb.write('c._');
      wb.write('d.x', () => { cbStack.push('d'); });
      wb.write('e', () => {
        assert.deepEqual(stack, ['a._', 'b.x', 'c._', 'd.x', 'e']);
        assert.deepEqual(cbStack, ['b', 'd']);
        done();
      });
    });
    it('bytes', done => {
      wb.write(toBytes('a._'));
      wb.write(toBytes('b.x'), () => { cbStack.push('b'); });
      wb.write(toBytes('c._'));
      wb.write(toBytes('d.x'), () => { cbStack.push('d'); });
      wb.write(toBytes('e'), () => {
        assert.deepEqual(stack.map(val => typeof val === 'string' ? '' :  fromBytes(val)), ['a._', 'b.x', 'c._', 'd.x', 'e']);
        assert.deepEqual(cbStack, ['b', 'd']);
        done();
      });
    });
    it('string/bytes mixed', done => {
      wb.write('a._');
      wb.write('b.x', () => { cbStack.push('b'); });
      wb.write(toBytes('c._'));
      wb.write(toBytes('d.x'), () => { cbStack.push('d'); });
      wb.write(toBytes('e'), () => {
        assert.deepEqual(stack.map(val => typeof val === 'string' ? val :  fromBytes(val)), ['a._', 'b.x', 'c._', 'd.x', 'e']);
        assert.deepEqual(cbStack, ['b', 'd']);
        done();
      });
    });
    it('write callback works for empty chunks', done => {
      wb.write('a', () => { cbStack.push('a'); });
      wb.write('', () => { cbStack.push('b'); });
      wb.write(toBytes('c'), () => { cbStack.push('c'); });
      wb.write(new Uint8Array(0), () => { cbStack.push('d'); });
      wb.write('e', () => {
        assert.deepEqual(stack.map(val => typeof val === 'string' ? val :  fromBytes(val)), ['a', '', 'c', '', 'e']);
        assert.deepEqual(cbStack, ['a', 'b', 'c', 'd']);
        done();
      });
    });
    it('writeSync', done => {
      wb.write('a', () => { cbStack.push('a'); });
      wb.write('b', () => { cbStack.push('b'); });
      wb.write('c', () => { cbStack.push('c'); });
      wb.writeSync('d');
      assert.deepEqual(stack, ['a', 'b', 'c', 'd']);
      assert.deepEqual(cbStack, ['a', 'b', 'c']);
      wb.write('x', () => { cbStack.push('x'); });
      wb.write('', () => {
        assert.deepEqual(stack, ['a', 'b', 'c', 'd', 'x', '']);
        assert.deepEqual(cbStack, ['a', 'b', 'c', 'x']);
        done();
      });
    });
    it('preserves write options when writeSync flushes queued and empty chunks', async () => {
      const actions: [string | Uint8Array, boolean | undefined, boolean | undefined][] = [];
      wb = new WriteBuffer((data, promiseResult, hasCallback, showOnTerm) => {
        actions.push([data, hasCallback, showOnTerm]);
      });
      wb.write('', undefined, false, false);
      wb.write('hidden', undefined, true, false);
      wb.writeSync('sync');
      await new Promise<void>(resolve => wb.write('next', resolve, false, true));

      assert.deepEqual(actions, [
        ['', false, false],
        ['hidden', true, false],
        ['sync', undefined, undefined],
        ['next', false, true]
      ]);
    });

    it('writeSync called from action does not overflow callstack - issue #3265', () => {
      wb = new WriteBuffer(data => {
        const num = parseInt(data as string);
        if (num < 1000000) {
          wb.writeSync('' + (num + 1));
        }
      });
      wb.writeSync('1');
    });
    it('writeSync maxSubsequentCalls argument', () => {
      let last: string = '';
      wb = new WriteBuffer(data => {
        last = data as string;
        const num = parseInt(data as string);
        if (num < 1000000) {
          wb.writeSync('' + (num + 1), 10);
        }
      });
      wb.writeSync('1', 10);
      assert.equal(last, '11'); // 1 + 10 sub calls = 11
    });
  });

  describe('callback errors', () => {
    let originalQueueMicrotask: typeof queueMicrotask;
    let errorTasks: (() => void)[];

    beforeEach(() => {
      originalQueueMicrotask = globalThis.queueMicrotask;
      errorTasks = [];
      globalThis.queueMicrotask = callback => { errorTasks.push(callback); };
    });

    afterEach(() => {
      globalThis.queueMicrotask = originalQueueMicrotask;
      wb.dispose();
    });

    it('continues queued and later writes after a callback throws', async () => {
      const error = new Error('write callback failed');
      wb.write('a', () => {
        cbStack.push('a');
        throw error;
      });
      await new Promise<void>(resolve => wb.write('b', () => {
        cbStack.push('b');
        resolve();
      }));
      await new Promise<void>(resolve => wb.write('c', () => {
        cbStack.push('c');
        resolve();
      }));

      assert.deepEqual(stack, ['a', 'b', 'c']);
      assert.deepEqual(cbStack, ['a', 'b', 'c']);
      assert.lengthOf(errorTasks, 1);
      assert.throws(errorTasks[0], Error, error.message);
    });

    it('preserves write order when a callback appends data and throws', async () => {
      const error = new Error('appending callback failed');
      const completed = new Promise<void>(resolve => {
        wb.write('a', () => {
          cbStack.push('a');
          wb.write('c', () => {
            cbStack.push('c');
            resolve();
          });
          throw error;
        });
        wb.write('b', () => { cbStack.push('b'); });
      });
      await completed;

      assert.deepEqual(stack, ['a', 'b', 'c']);
      assert.deepEqual(cbStack, ['a', 'b', 'c']);
      assert.lengthOf(errorTasks, 1);
      assert.throws(errorTasks[0], Error, error.message);
    });

    it('continues synchronous and asynchronous writes after a flushed callback throws', async () => {
      const error = new Error('flushed callback failed');
      wb.write('a', () => {
        cbStack.push('a');
        throw error;
      });
      wb.write('b', () => { cbStack.push('b'); });
      wb.writeSync('c');
      wb.writeSync('d');
      await new Promise<void>(resolve => wb.write('e', () => {
        cbStack.push('e');
        resolve();
      }));

      assert.deepEqual(stack, ['a', 'b', 'c', 'd', 'e']);
      assert.deepEqual(cbStack, ['a', 'b', 'e']);
      assert.lengthOf(errorTasks, 1);
      assert.throws(errorTasks[0], Error, error.message);
    });
  });
});
