"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const path = require("path");
const os = require("os");
const fs = require("fs");
const pty = require("node-pty");
const Terminal_1 = require("browser/Terminal");
const COLS = 80;
const ROWS = 25;
const TESTFILES = glob.sync('**/escape_sequence_files/*.in', { cwd: path.join(__dirname, '../..') });
const SKIP_FILES = [
    't0055-EL.in',
    't0084-CBT.in',
    't0101-NLM.in',
    't0103-reverse_wrap.in',
    't0504-vim.in'
];
if (os.platform() === 'darwin') {
    SKIP_FILES.push('t0003-line_wrap.in', 't0005-CR.in', 't0009-NEL.in', 't0503-zsh_ls_color.in');
}
const FILES = TESTFILES.filter(value => !SKIP_FILES.includes(value.split('/').slice(-1)[0]));
describe('Escape Sequence Files', function () {
    this.timeout(1000);
    let ptyTerm;
    let slaveEnd;
    let term;
    let customHandler;
    before(() => {
        if (process.platform === 'win32') {
            return;
        }
        ptyTerm = pty.open({ cols: COLS, rows: ROWS });
        slaveEnd = ptyTerm._slave;
        term = new Terminal_1.Terminal({ cols: COLS, rows: ROWS });
        ptyTerm._master.on('data', (data) => term.write(data));
    });
    after(() => {
        if (process.platform === 'win32') {
            return;
        }
        ptyTerm._master.end();
        ptyTerm._master.destroy();
    });
    for (const filename of FILES) {
        (process.platform === 'win32' ? it.skip : it)(filename.split('/').slice(-1)[0], async () => {
            if (customHandler) {
                customHandler.dispose();
            }
            slaveEnd.write('\r\n');
            term.reset();
            slaveEnd.write('\x1bc\x1b[H');
            let content = '';
            const OSC_CODE = 12345;
            await new Promise(resolve => {
                customHandler = term.registerOscHandler(OSC_CODE, () => {
                    content = terminalToString(term);
                    resolve();
                    return true;
                });
                slaveEnd.write(fs.readFileSync(filename, 'utf8'));
                slaveEnd.write(`\x1b]${OSC_CODE};\x07`);
            });
            const expected = fs.readFileSync(filename.split('.')[0] + '.text', 'utf8');
            const expectedRightTrimmed = expected.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
            if (content !== expectedRightTrimmed) {
                throw new Error(formatError(fs.readFileSync(filename, 'utf8'), content, expected));
            }
        });
    }
});
function formatError(input, output, expected) {
    function addLineNumber(start, color) {
        let counter = start || 0;
        return (s) => {
            counter++;
            return '\x1b[33m' + (' ' + counter).slice(-2) + color + s;
        };
    }
    const line80 = '12345678901234567890123456789012345678901234567890123456789012345678901234567890';
    let s = '';
    s += `\n\x1b[34m${JSON.stringify(input)}`;
    s += `\n\x1b[33m  ${line80}\n`;
    s += output.split('\n').map(addLineNumber(0, '\x1b[31m')).join('\n');
    s += `\n\x1b[33m  ${line80}\n`;
    s += expected.split('\n').map(addLineNumber(0, '\x1b[32m')).join('\n');
    return s;
}
function terminalToString(term) {
    let result = '';
    let lineText = '';
    for (let line = term.buffer.ybase; line < term.buffer.ybase + term.rows; line++) {
        lineText = term.buffer.lines.get(line).translateToString(true);
        lineText = lineText.replace(/\s+$/, '');
        result += lineText;
        result += '\n';
    }
    return result;
}
//# sourceMappingURL=Terminal2.test.js.map