"use strict";
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const xterm_benchmark_1 = require("xterm-benchmark");
const node_pty_1 = require("node-pty");
const TextDecoder_1 = require("common/input/TextDecoder");
const Terminal_1 = require("browser/Terminal");
(0, xterm_benchmark_1.perfContext)('Terminal: ls -lR /usr/lib', () => {
    let content = '';
    let contentUtf8;
    (0, xterm_benchmark_1.before)(async () => {
        // grab output from "ls -lR /usr"
        const p = (0, node_pty_1.spawn)('ls', ['--color=auto', '-lR', '/usr/lib'], {
            name: 'xterm-256color',
            cols: 80,
            rows: 25,
            cwd: process.env.HOME,
            env: process.env,
            encoding: null // needs to be fixed in node-pty
        });
        const chunks = [];
        let length = 0;
        p.onData(data => {
            chunks.push(data);
            length += data.length;
        });
        await new Promise(resolve => p.onExit(() => resolve()));
        contentUtf8 = Buffer.concat(chunks, length);
        // translate to content string
        const buffer = new Uint32Array(contentUtf8.length);
        const decoder = new TextDecoder_1.Utf8ToUtf32();
        const codepoints = decoder.decode(contentUtf8, buffer);
        for (let i = 0; i < codepoints; ++i) {
            content += (0, TextDecoder_1.stringFromCodePoint)(buffer[i]);
            // peek into content to force flat repr in v8
            if (!(i % 10000000)) {
                content[i];
            }
        }
    });
    (0, xterm_benchmark_1.perfContext)('write/string/async', () => {
        let terminal;
        (0, xterm_benchmark_1.before)(() => {
            terminal = new Terminal_1.Terminal({ cols: 80, rows: 25, scrollback: 1000 });
        });
        new xterm_benchmark_1.ThroughputRuntimeCase('', async () => {
            await new Promise(res => terminal.write(content, res));
            return { payloadSize: contentUtf8.length };
        }, { fork: false }).showAverageThroughput();
    });
    (0, xterm_benchmark_1.perfContext)('write/Utf8/async', () => {
        let terminal;
        (0, xterm_benchmark_1.before)(() => {
            terminal = new Terminal_1.Terminal({ cols: 80, rows: 25, scrollback: 1000 });
        });
        new xterm_benchmark_1.ThroughputRuntimeCase('', async () => {
            await new Promise(res => terminal.write(content, res));
            return { payloadSize: contentUtf8.length };
        }, { fork: false }).showAverageThroughput();
    });
});
