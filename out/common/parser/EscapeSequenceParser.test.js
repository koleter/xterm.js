"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EscapeSequenceParser_1 = require("common/parser/EscapeSequenceParser");
const chai_1 = require("chai");
const TextDecoder_1 = require("common/input/TextDecoder");
const Params_1 = require("common/parser/Params");
const OscParser_1 = require("common/parser/OscParser");
const DcsParser_1 = require("common/parser/DcsParser");
function r(a, b) {
    let c = b - a;
    const arr = new Array(c);
    while (c--) {
        arr[c] = String.fromCharCode(--b);
    }
    return arr;
}
class MockOscPutParser {
    constructor() {
        this._fallback = () => { };
        this.data = '';
    }
    reset() {
        this.data = '';
    }
    put(data, start, end) {
        this.data += (0, TextDecoder_1.utf32ToString)(data, start, end);
    }
    dispose() { }
    start() { }
    end(success) {
        this.data += `, success: ${success}`;
        const id = parseInt(this.data.slice(0, this.data.indexOf(';')));
        if (!isNaN(id)) {
            this._fallback(id, 'END', this.data.slice(this.data.indexOf(';') + 1));
        }
    }
    registerHandler(ident, handler) {
        throw new Error('not implemented');
    }
    setHandler(ident, handler) {
        throw new Error('not implemented');
    }
    clearHandler(ident) {
        throw new Error('not implemented');
    }
    setHandlerFallback(handler) {
        this._fallback = handler;
    }
}
const oscPutParser = new MockOscPutParser();
class TestEscapeSequenceParser extends EscapeSequenceParser_1.EscapeSequenceParser {
    constructor() {
        super(...arguments);
        this._trackStack = false;
        this.trackedStack = [];
    }
    get transitions() {
        return this._transitions;
    }
    get osc() {
        return this._oscParser.data;
    }
    set osc(value) {
        this._oscParser.data = value;
    }
    get params() {
        return this._params.toArray();
    }
    set params(value) {
        this._params = Params_1.Params.fromArray(value);
    }
    get realParams() {
        return this._params;
    }
    get collect() {
        return this.identToString(this._collect);
    }
    set collect(value) {
        this._collect = 0;
        for (let i = 0; i < value.length; ++i) {
            this._collect <<= 8;
            this._collect |= value.charCodeAt(i);
        }
    }
    mockOscParser() {
        this._oscParser = oscPutParser;
    }
    identifier(id) {
        return this._identifier(id);
    }
    get parseStack() {
        return this._parseStack;
    }
    trackStackSavesOnPause() {
        this._trackStack = true;
    }
    parse(data, length, promiseResult) {
        const result = super.parse(data, length, promiseResult);
        if (result instanceof Promise && this._trackStack) {
            this.trackedStack.push({ ...this.parseStack });
        }
        return result;
    }
}
const testTerminal = {
    calls: [],
    clear() {
        this.calls = [];
    },
    compare(value) {
        chai_1.assert.deepEqual(this.calls, value);
    },
    print(data, start, end) {
        let s = '';
        for (let i = start; i < end; ++i) {
            s += (0, TextDecoder_1.stringFromCodePoint)(data[i]);
        }
        this.calls.push(['print', s]);
    },
    actionOSC(s) {
        this.calls.push(['osc', s]);
    },
    actionExecute(flag) {
        this.calls.push(['exe', flag]);
    },
    actionCSI(collect, params, flag) {
        this.calls.push(['csi', collect, params.toArray(), flag]);
    },
    actionESC(collect, flag) {
        this.calls.push(['esc', collect, flag]);
    },
    actionDCSHook(params) {
        this.calls.push(['dcs hook', params.toArray()]);
    },
    actionDCSPrint(s) {
        this.calls.push(['dcs put', s]);
    },
    actionDCSUnhook(success) {
        this.calls.push(['dcs unhook', success]);
    }
};
const states = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13
];
let state;
const testParser = new TestEscapeSequenceParser();
testParser.mockOscParser();
testParser.setPrintHandler(testTerminal.print.bind(testTerminal));
testParser.setCsiHandlerFallback((ident, params) => {
    const id = testParser.identToString(ident);
    testTerminal.actionCSI(id.slice(0, -1), params, id.slice(-1));
});
testParser.setEscHandlerFallback((ident) => {
    const id = testParser.identToString(ident);
    testTerminal.actionESC(id.slice(0, -1), id.slice(-1));
});
testParser.setExecuteHandlerFallback((code) => {
    testTerminal.actionExecute(String.fromCharCode(code));
});
testParser.setOscHandlerFallback((identifier, action, data) => {
    if (identifier === -1)
        testTerminal.actionOSC(data);
    else if (action === 'END')
        testTerminal.actionOSC('' + identifier + ';' + data);
});
testParser.setDcsHandlerFallback((collectAndFlag, action, payload) => {
    switch (action) {
        case 'HOOK':
            testTerminal.actionDCSHook(payload);
            break;
        case 'PUT':
            testTerminal.actionDCSPrint(payload);
            break;
        case 'UNHOOK':
            testTerminal.actionDCSUnhook(payload);
    }
});
function parse(parser, data) {
    const container = new Uint32Array(data.length);
    const decoder = new TextDecoder_1.StringToUtf32();
    parser.parse(container, decoder.decode(data, container));
}
describe('EscapeSequenceParser', () => {
    const parser = testParser;
    describe('Parser init and methods', () => {
        it('constructor', () => {
            let p = new TestEscapeSequenceParser();
            chai_1.assert.deepEqual(p.transitions, EscapeSequenceParser_1.VT500_TRANSITION_TABLE);
            p = new TestEscapeSequenceParser(EscapeSequenceParser_1.VT500_TRANSITION_TABLE);
            chai_1.assert.deepEqual(p.transitions, EscapeSequenceParser_1.VT500_TRANSITION_TABLE);
            const tansitions = new EscapeSequenceParser_1.TransitionTable(10);
            p = new TestEscapeSequenceParser(tansitions);
            chai_1.assert.deepEqual(p.transitions, tansitions);
        });
        it('inital states', () => {
            chai_1.assert.equal(parser.initialState, 0);
            chai_1.assert.equal(parser.currentState, 0);
            chai_1.assert.equal(parser.osc, '');
            chai_1.assert.deepEqual(parser.params, [0]);
            chai_1.assert.equal(parser.collect, '');
        });
        it('reset states', () => {
            parser.currentState = 124;
            parser.osc = '#';
            parser.params = [123];
            parser.collect = '#';
            parser.reset();
            chai_1.assert.equal(parser.currentState, 0);
            chai_1.assert.equal(parser.osc, '');
            chai_1.assert.deepEqual(parser.params, [0]);
            chai_1.assert.equal(parser.collect, '');
        });
    });
    describe('state transitions and actions', () => {
        it('state GROUND execute action', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 0;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state GROUND print action', () => {
            parser.reset();
            testTerminal.clear();
            const printables = r(0x20, 0x7f);
            for (let i = 0; i < printables.length; ++i) {
                parser.currentState = 0;
                parse(parser, printables[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([['print', printables[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans ANYWHERE --> GROUND with actions', () => {
            const exes = [
                '\x18', '\x1a',
                '\x80', '\x81', '\x82', '\x83', '\x84', '\x85', '\x86', '\x87', '\x88',
                '\x89', '\x8a', '\x8b', '\x8c', '\x8d', '\x8e', '\x8f',
                '\x91', '\x92', '\x93', '\x94', '\x95', '\x96', '\x97', '\x99', '\x9a'
            ];
            const exceptions = {
                8: { '\x18': [], '\x1a': [] },
                13: { '\x18': [['dcs unhook', false]], '\x1a': [['dcs unhook', false]] }
            };
            parser.reset();
            testTerminal.clear();
            for (state in states) {
                for (let i = 0; i < exes.length; ++i) {
                    parser.currentState = state;
                    parse(parser, exes[i]);
                    chai_1.assert.equal(parser.currentState, 0);
                    testTerminal.compare((state in exceptions ? exceptions[state][exes[i]] : 0) || [['exe', exes[i]]]);
                    parser.reset();
                    testTerminal.clear();
                }
                parse(parser, '\x9c');
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans ANYWHERE --> ESCAPE with clear', () => {
            parser.reset();
            for (state in states) {
                parser.currentState = state;
                parser.params = [23];
                parser.collect = '#';
                parse(parser, '\x1b');
                chai_1.assert.equal(parser.currentState, 1);
                chai_1.assert.deepEqual(parser.params, [0]);
                chai_1.assert.equal(parser.collect, '');
                parser.reset();
            }
        });
        it('state ESCAPE execute rules', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 1;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 1);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state ESCAPE ignore', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 1;
            parse(parser, '\x7f');
            chai_1.assert.equal(parser.currentState, 1);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('trans ESCAPE --> GROUND with ecs_dispatch action', () => {
            parser.reset();
            testTerminal.clear();
            let dispatches = r(0x30, 0x50);
            dispatches = dispatches.concat(r(0x51, 0x58));
            dispatches = dispatches.concat(['\x59', '\x5a']);
            dispatches = dispatches.concat(r(0x60, 0x7f));
            for (let i = 0; i < dispatches.length; ++i) {
                parser.currentState = 1;
                parse(parser, dispatches[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([['esc', '', dispatches[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans ESCAPE --> ESCAPE_INTERMEDIATE with collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 1;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 2);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('state ESCAPE_INTERMEDIATE execute rules', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 2;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 2);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state ESCAPE_INTERMEDIATE ignore', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 2;
            parse(parser, '\x7f');
            chai_1.assert.equal(parser.currentState, 2);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('state ESCAPE_INTERMEDIATE collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 2;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 2);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('trans ESCAPE_INTERMEDIATE --> GROUND with esc_dispatch action', () => {
            parser.reset();
            testTerminal.clear();
            const collect = r(0x30, 0x7f);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 2;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare((collect[i] === '\x5c') ? [] : [['esc', '', collect[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans ANYWHERE/ESCAPE --> CSI_ENTRY with clear', () => {
            parser.reset();
            parser.currentState = 1;
            parser.params = [123];
            parser.collect = '#';
            parse(parser, '[');
            chai_1.assert.equal(parser.currentState, 3);
            chai_1.assert.deepEqual(parser.params, [0]);
            chai_1.assert.equal(parser.collect, '');
            parser.reset();
            for (state in states) {
                parser.currentState = state;
                parser.params = [123];
                parser.collect = '#';
                parse(parser, '\x9b');
                chai_1.assert.equal(parser.currentState, 3);
                chai_1.assert.deepEqual(parser.params, [0]);
                chai_1.assert.equal(parser.collect, '');
                parser.reset();
            }
        });
        it('state CSI_ENTRY execute rules', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 3;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 3);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state CSI_ENTRY ignore', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 3;
            parse(parser, '\x7f');
            chai_1.assert.equal(parser.currentState, 3);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('trans CSI_ENTRY --> GROUND with csi_dispatch action', () => {
            parser.reset();
            const dispatches = r(0x40, 0x7f);
            for (let i = 0; i < dispatches.length; ++i) {
                parser.currentState = 3;
                parse(parser, dispatches[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([['csi', '', [0], dispatches[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans CSI_ENTRY --> CSI_PARAM with param/collect actions', () => {
            parser.reset();
            const params = ['\x30', '\x31', '\x32', '\x33', '\x34', '\x35', '\x36', '\x37', '\x38', '\x39'];
            const collect = ['\x3c', '\x3d', '\x3e', '\x3f'];
            for (let i = 0; i < params.length; ++i) {
                parser.currentState = 3;
                parse(parser, params[i]);
                chai_1.assert.equal(parser.currentState, 4);
                chai_1.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
                parser.reset();
            }
            parser.currentState = 3;
            parse(parser, '\x3b');
            chai_1.assert.equal(parser.currentState, 4);
            chai_1.assert.deepEqual(parser.params, [0, 0]);
            parser.reset();
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 3;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 4);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('state CSI_PARAM execute rules', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 4;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 4);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state CSI_PARAM param action', () => {
            parser.reset();
            const params = ['\x30', '\x31', '\x32', '\x33', '\x34', '\x35', '\x36', '\x37', '\x38', '\x39'];
            for (let i = 0; i < params.length; ++i) {
                parser.currentState = 4;
                parse(parser, params[i]);
                chai_1.assert.equal(parser.currentState, 4);
                chai_1.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
                parser.reset();
            }
            parser.currentState = 4;
            parse(parser, '\x3b');
            chai_1.assert.equal(parser.currentState, 4);
            chai_1.assert.deepEqual(parser.params, [0, 0]);
            parser.reset();
        });
        it('state CSI_PARAM ignore', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 4;
            parse(parser, '\x7f');
            chai_1.assert.equal(parser.currentState, 4);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('trans CSI_PARAM --> GROUND with csi_dispatch action', () => {
            parser.reset();
            const dispatches = r(0x40, 0x7f);
            for (let i = 0; i < dispatches.length; ++i) {
                parser.currentState = 4;
                parser.params = [0, 1];
                parse(parser, dispatches[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([['csi', '', [0, 1], dispatches[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans CSI_ENTRY --> CSI_INTERMEDIATE with collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 3;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 5);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('trans CSI_PARAM --> CSI_INTERMEDIATE with collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 4;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 5);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('state CSI_INTERMEDIATE execute rules', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 5;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 5);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state CSI_INTERMEDIATE collect', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 5;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 5);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('state CSI_INTERMEDIATE ignore', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 5;
            parse(parser, '\x7f');
            chai_1.assert.equal(parser.currentState, 5);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('trans CSI_INTERMEDIATE --> GROUND with csi_dispatch action', () => {
            parser.reset();
            const dispatches = r(0x40, 0x7f);
            for (let i = 0; i < dispatches.length; ++i) {
                parser.currentState = 5;
                parser.params = [0, 1];
                parse(parser, dispatches[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([['csi', '', [0, 1], dispatches[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans CSI_ENTRY --> CSI_PARAM for ":" (0x3a)', () => {
            parser.reset();
            parser.currentState = 3;
            parse(parser, '\x3a');
            chai_1.assert.equal(parser.currentState, 4);
            parser.reset();
        });
        it('trans CSI_PARAM --> CSI_IGNORE', () => {
            parser.reset();
            const chars = ['\x3c', '\x3d', '\x3e', '\x3f'];
            for (let i = 0; i < chars.length; ++i) {
                parser.currentState = 4;
                parse(parser, '\x3b' + chars[i]);
                chai_1.assert.equal(parser.currentState, 6);
                chai_1.assert.deepEqual(parser.params, [0, 0]);
                parser.reset();
            }
        });
        it('trans CSI_PARAM --> CSI_IGNORE', () => {
            parser.reset();
            const chars = ['\x3c', '\x3d', '\x3e', '\x3f'];
            for (let i = 0; i < chars.length; ++i) {
                chai_1.assert.deepEqual(parser.params, [0]);
                parser.currentState = 4;
                parse(parser, '\x3b' + chars[i]);
                chai_1.assert.equal(parser.currentState, 6);
                chai_1.assert.deepEqual(parser.params, [0, 0]);
                parser.reset();
            }
        });
        it('trans CSI_INTERMEDIATE --> CSI_IGNORE', () => {
            parser.reset();
            const chars = r(0x30, 0x40);
            for (let i = 0; i < chars.length; ++i) {
                parser.currentState = 5;
                parse(parser, chars[i]);
                chai_1.assert.equal(parser.currentState, 6);
                chai_1.assert.deepEqual(parser.params, [0]);
                parser.reset();
            }
        });
        it('state CSI_IGNORE execute rules', () => {
            parser.reset();
            testTerminal.clear();
            let exes = r(0x00, 0x18);
            exes = exes.concat(['\x19']);
            exes = exes.concat(r(0x1c, 0x20));
            for (let i = 0; i < exes.length; ++i) {
                parser.currentState = 6;
                parse(parser, exes[i]);
                chai_1.assert.equal(parser.currentState, 6);
                testTerminal.compare([['exe', exes[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state CSI_IGNORE ignore', () => {
            parser.reset();
            testTerminal.clear();
            let ignored = r(0x20, 0x40);
            ignored = ignored.concat(['\x7f']);
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 6;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 6);
                testTerminal.compare([]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans CSI_IGNORE --> GROUND', () => {
            parser.reset();
            const dispatches = r(0x40, 0x7f);
            for (let i = 0; i < dispatches.length; ++i) {
                parser.currentState = 6;
                parser.params = [0, 1];
                parse(parser, dispatches[i]);
                chai_1.assert.equal(parser.currentState, 0);
                testTerminal.compare([]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans ANYWHERE/ESCAPE --> SOS_PM_APC_STRING', () => {
            parser.reset();
            let initializers = ['\x58', '\x5e', '\x5f'];
            for (let i = 0; i < initializers.length; ++i) {
                parse(parser, '\x1b' + initializers[i]);
                chai_1.assert.equal(parser.currentState, 7);
                parser.reset();
            }
            for (state in states) {
                parser.currentState = state;
                initializers = ['\x98', '\x9e', '\x9f'];
                for (let i = 0; i < initializers.length; ++i) {
                    parse(parser, initializers[i]);
                    chai_1.assert.equal(parser.currentState, 7);
                    parser.reset();
                }
            }
        });
        it('state SOS_PM_APC_STRING ignore rules', () => {
            parser.reset();
            let ignored = r(0x00, 0x18);
            ignored = ignored.concat(['\x19']);
            ignored = ignored.concat(r(0x1c, 0x20));
            ignored = ignored.concat(r(0x20, 0x80));
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 7;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 7);
                parser.reset();
            }
        });
        it('trans ANYWHERE/ESCAPE --> OSC_STRING', () => {
            parser.reset();
            parse(parser, '\x1b]');
            chai_1.assert.equal(parser.currentState, 8);
            parser.reset();
            for (state in states) {
                parser.currentState = state;
                parse(parser, '\x9d');
                chai_1.assert.equal(parser.currentState, 8);
                parser.reset();
            }
        });
        it('state OSC_STRING ignore rules', () => {
            parser.reset();
            const ignored = [
                '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x08',
                '\x09', '\x0a', '\x0b', '\x0c', '\x0d', '\x0e', '\x0f', '\x10', '\x11',
                '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x19', '\x1c', '\x1d', '\x1e', '\x1f'
            ];
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 8;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 8);
                chai_1.assert.equal(parser.osc, '');
                parser.reset();
            }
        });
        it('state OSC_STRING put action', () => {
            parser.reset();
            const puts = r(0x20, 0x80);
            for (let i = 0; i < puts.length; ++i) {
                parser.currentState = 8;
                parse(parser, puts[i]);
                chai_1.assert.equal(parser.currentState, 8);
                chai_1.assert.equal(parser.osc, puts[i]);
                parser.reset();
            }
        });
        it('state DCS_ENTRY', () => {
            parser.reset();
            parse(parser, '\x1bP');
            chai_1.assert.equal(parser.currentState, 9);
            parser.reset();
            for (state in states) {
                parser.currentState = state;
                parse(parser, '\x90');
                chai_1.assert.equal(parser.currentState, 9);
                parser.reset();
            }
        });
        it('state DCS_ENTRY ignore rules', () => {
            parser.reset();
            const ignored = [
                '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08',
                '\x09', '\x0a', '\x0b', '\x0c', '\x0d', '\x0e', '\x0f', '\x10', '\x11',
                '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x19', '\x1c', '\x1d', '\x1e', '\x1f', '\x7f'
            ];
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 9;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 9);
                parser.reset();
            }
        });
        it('state DCS_ENTRY --> DCS_PARAM with param/collect actions', () => {
            parser.reset();
            const params = ['\x30', '\x31', '\x32', '\x33', '\x34', '\x35', '\x36', '\x37', '\x38', '\x39'];
            const collect = ['\x3c', '\x3d', '\x3e', '\x3f'];
            for (let i = 0; i < params.length; ++i) {
                parser.currentState = 9;
                parse(parser, params[i]);
                chai_1.assert.equal(parser.currentState, 10);
                chai_1.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
                parser.reset();
            }
            parser.currentState = 9;
            parse(parser, '\x3b');
            chai_1.assert.equal(parser.currentState, 10);
            chai_1.assert.deepEqual(parser.params, [0, 0]);
            parser.reset();
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 9;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 10);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('state DCS_PARAM ignore rules', () => {
            parser.reset();
            const ignored = [
                '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08',
                '\x09', '\x0a', '\x0b', '\x0c', '\x0d', '\x0e', '\x0f', '\x10', '\x11',
                '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x19', '\x1c', '\x1d', '\x1e', '\x1f', '\x7f'
            ];
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 10;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 10);
                parser.reset();
            }
        });
        it('state DCS_PARAM param action', () => {
            parser.reset();
            const params = ['\x30', '\x31', '\x32', '\x33', '\x34', '\x35', '\x36', '\x37', '\x38', '\x39'];
            for (let i = 0; i < params.length; ++i) {
                parser.currentState = 10;
                parse(parser, params[i]);
                chai_1.assert.equal(parser.currentState, 10);
                chai_1.assert.deepEqual(parser.params, [params[i].charCodeAt(0) - 48]);
                parser.reset();
            }
            parser.currentState = 10;
            parse(parser, '\x3b');
            chai_1.assert.equal(parser.currentState, 10);
            chai_1.assert.deepEqual(parser.params, [0, 0]);
            parser.reset();
        });
        it('trans DCS_ENTRY --> DCS_PARAM for ":" (0x3a)', () => {
            parser.reset();
            parser.currentState = 9;
            parse(parser, '\x3a');
            chai_1.assert.equal(parser.currentState, 10);
            parser.reset();
        });
        it('trans DCS_PARAM --> DCS_IGNORE', () => {
            parser.reset();
            const chars = ['\x3c', '\x3d', '\x3e', '\x3f'];
            for (let i = 0; i < chars.length; ++i) {
                parser.currentState = 10;
                parse(parser, '\x3b' + chars[i]);
                chai_1.assert.equal(parser.currentState, 11);
                chai_1.assert.deepEqual(parser.params, [0, 0]);
                parser.reset();
            }
        });
        it('trans DCS_INTERMEDIATE --> DCS_IGNORE', () => {
            parser.reset();
            const chars = r(0x30, 0x40);
            for (let i = 0; i < chars.length; ++i) {
                parser.currentState = 12;
                parse(parser, chars[i]);
                chai_1.assert.equal(parser.currentState, 11);
                parser.reset();
            }
        });
        it('state DCS_IGNORE ignore rules', () => {
            parser.reset();
            let ignored = [
                '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08',
                '\x09', '\x0a', '\x0b', '\x0c', '\x0d', '\x0e', '\x0f', '\x10', '\x11',
                '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x19', '\x1c', '\x1d', '\x1e', '\x1f', '\x7f'
            ];
            ignored = ignored.concat(r(0x20, 0x80));
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 11;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 11);
                parser.reset();
            }
        });
        it('trans DCS_ENTRY --> DCS_INTERMEDIATE with collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 9;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 12);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('trans DCS_PARAM --> DCS_INTERMEDIATE with collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 10;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 12);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('state DCS_INTERMEDIATE ignore rules', () => {
            parser.reset();
            const ignored = [
                '\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08',
                '\x09', '\x0a', '\x0b', '\x0c', '\x0d', '\x0e', '\x0f', '\x10', '\x11',
                '\x12', '\x13', '\x14', '\x15', '\x16', '\x17', '\x19', '\x1c', '\x1d', '\x1e', '\x1f', '\x7f'
            ];
            for (let i = 0; i < ignored.length; ++i) {
                parser.currentState = 12;
                parse(parser, ignored[i]);
                chai_1.assert.equal(parser.currentState, 12);
                parser.reset();
            }
        });
        it('state DCS_INTERMEDIATE collect action', () => {
            parser.reset();
            const collect = r(0x20, 0x30);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 12;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 12);
                chai_1.assert.equal(parser.collect, collect[i]);
                parser.reset();
            }
        });
        it('trans DCS_INTERMEDIATE --> DCS_IGNORE', () => {
            parser.reset();
            const chars = r(0x30, 0x40);
            for (let i = 0; i < chars.length; ++i) {
                parser.currentState = 12;
                parse(parser, '\x20' + chars[i]);
                chai_1.assert.equal(parser.currentState, 11);
                chai_1.assert.equal(parser.collect, '\x20');
                parser.reset();
            }
        });
        it('trans DCS_ENTRY --> DCS_PASSTHROUGH with hook', () => {
            parser.reset();
            testTerminal.clear();
            const collect = r(0x40, 0x7f);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 9;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 13);
                testTerminal.compare([['dcs hook', [0]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans DCS_PARAM --> DCS_PASSTHROUGH with hook', () => {
            parser.reset();
            testTerminal.clear();
            const collect = r(0x40, 0x7f);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 10;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 13);
                testTerminal.compare([['dcs hook', [0]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('trans DCS_INTERMEDIATE --> DCS_PASSTHROUGH with hook', () => {
            parser.reset();
            testTerminal.clear();
            const collect = r(0x40, 0x7f);
            for (let i = 0; i < collect.length; ++i) {
                parser.currentState = 12;
                parse(parser, collect[i]);
                chai_1.assert.equal(parser.currentState, 13);
                testTerminal.compare([['dcs hook', [0]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state DCS_PASSTHROUGH put action', () => {
            parser.reset();
            testTerminal.clear();
            let puts = r(0x00, 0x18);
            puts = puts.concat(['\x19']);
            puts = puts.concat(r(0x1c, 0x20));
            puts = puts.concat(r(0x20, 0x7f));
            for (let i = 0; i < puts.length; ++i) {
                parser.currentState = 13;
                parse(parser, puts[i]);
                chai_1.assert.equal(parser.currentState, 13);
                testTerminal.compare([['dcs put', puts[i]]]);
                parser.reset();
                testTerminal.clear();
            }
        });
        it('state DCS_PASSTHROUGH ignore', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 13;
            parse(parser, '\x7f');
            chai_1.assert.equal(parser.currentState, 13);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
    });
    function test(s, value, noReset) {
        if (!noReset) {
            parser.reset();
            testTerminal.clear();
        }
        parse(parser, s);
        testTerminal.compare(value);
    }
    describe('escape sequence examples', () => {
        it('CSI with print and execute', () => {
            test('\x1b[<31;5mHello World! öäü€\nabc', [
                ['csi', '<', [31, 5], 'm'],
                ['print', 'Hello World! öäü€'],
                ['exe', '\n'],
                ['print', 'abc']
            ], null);
        });
        it('OSC', () => {
            test('\x1b]0;abc123€öäü\x07', [
                ['osc', '0;abc123€öäü, success: true']
            ], null);
        });
        it('single DCS', () => {
            test('\x1bP1;2;3+$aäbc;däe\x9c', [
                ['dcs hook', [1, 2, 3]],
                ['dcs put', 'äbc;däe'],
                ['dcs unhook', true]
            ], null);
        });
        it('multi DCS', () => {
            test('\x1bP1;2;3+$abc;de', [
                ['dcs hook', [1, 2, 3]],
                ['dcs put', 'bc;de']
            ], null);
            testTerminal.clear();
            test('abc\x9c', [
                ['dcs put', 'abc'],
                ['dcs unhook', true]
            ], true);
        });
        it('print + DCS(C1)', () => {
            test('abc\x901;2;3+$abc;de\x9c', [
                ['print', 'abc'],
                ['dcs hook', [1, 2, 3]],
                ['dcs put', 'bc;de'],
                ['dcs unhook', true]
            ], null);
        });
        it('print + PM(C1) + print', () => {
            test('abc\x98123tzf\x9cdefg', [
                ['print', 'abc'],
                ['print', 'defg']
            ], null);
        });
        it('print + OSC(C1) + print', () => {
            test('abc\x9d123;tzf\x9cdefg', [
                ['print', 'abc'],
                ['osc', '123;tzf, success: true'],
                ['print', 'defg']
            ], null);
        });
        it('error recovery', () => {
            test('\x1b[1€abcdefg\x9b<;c', [
                ['print', 'abcdefg'],
                ['csi', '<', [0, 0], 'c']
            ], null);
        });
        it('7bit ST should be swallowed', () => {
            test('abc\x9d123;tzf\x1b\\defg', [
                ['print', 'abc'],
                ['osc', '123;tzf, success: true'],
                ['print', 'defg']
            ], null);
        });
        it('colon notation in CSI params', () => {
            test('\x1b[<31;5::123:;8mHello World! öäü€\nabc', [
                ['csi', '<', [31, 5, [-1, 123, -1], 8], 'm'],
                ['print', 'Hello World! öäü€'],
                ['exe', '\n'],
                ['print', 'abc']
            ], null);
        });
        it('colon notation in DCS params', () => {
            test('abc\x901;2::55;3+$abc;de\x9c', [
                ['print', 'abc'],
                ['dcs hook', [1, 2, [-1, 55], 3]],
                ['dcs put', 'bc;de'],
                ['dcs unhook', true]
            ], null);
        });
        it('CAN should abort DCS', () => {
            test('abc\x901;2::55;3+$abc;de\x18', [
                ['print', 'abc'],
                ['dcs hook', [1, 2, [-1, 55], 3]],
                ['dcs put', 'bc;de'],
                ['dcs unhook', false]
            ], null);
        });
        it('SUB should abort DCS', () => {
            test('abc\x901;2::55;3+$abc;de\x1a', [
                ['print', 'abc'],
                ['dcs hook', [1, 2, [-1, 55], 3]],
                ['dcs put', 'bc;de'],
                ['dcs unhook', false]
            ], null);
        });
        it('CAN should abort OSC', () => {
            test('\x1b]0;abc123€öäü\x18', [
                ['osc', '0;abc123€öäü, success: false']
            ], null);
        });
        it('SUB should abort OSC', () => {
            test('\x1b]0;abc123€öäü\x1a', [
                ['osc', '0;abc123€öäü, success: false']
            ], null);
        });
    });
    describe('coverage tests', () => {
        it('CSI_IGNORE error', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 6;
            parse(parser, '€öäü');
            chai_1.assert.equal(parser.currentState, 6);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('DCS_IGNORE error', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 11;
            parse(parser, '€öäü');
            chai_1.assert.equal(parser.currentState, 11);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
        it('DCS_PASSTHROUGH error', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 13;
            parse(parser, '\x901;2;3+$a€öäü');
            chai_1.assert.equal(parser.currentState, 13);
            testTerminal.compare([['dcs hook', [1, 2, 3]], ['dcs put', '€öäü']]);
            parser.reset();
            testTerminal.clear();
        });
        it('error else of if (code > 159)', () => {
            parser.reset();
            testTerminal.clear();
            parser.currentState = 0;
            parse(parser, '\x9c');
            chai_1.assert.equal(parser.currentState, 0);
            testTerminal.compare([]);
            parser.reset();
            testTerminal.clear();
        });
    });
    describe('set/clear handler', () => {
        const INPUT = '\x1b[1;31mhello \x1b%Gwor\x1bEld!\x1b[0m\r\n$>\x1b]1;foo=bar\x1b\\';
        let parser2;
        let print = '';
        const esc = [];
        const csi = [];
        const exe = [];
        const osc = [];
        const dcs = [];
        function clearAccu() {
            print = '';
            esc.length = 0;
            csi.length = 0;
            exe.length = 0;
            osc.length = 0;
            dcs.length = 0;
        }
        beforeEach(() => {
            parser2 = new TestEscapeSequenceParser();
            clearAccu();
        });
        it('print handler', () => {
            parser2.setPrintHandler(function (data, start, end) {
                for (let i = start; i < end; ++i) {
                    print += (0, TextDecoder_1.stringFromCodePoint)(data[i]);
                }
            });
            parse(parser2, INPUT);
            chai_1.assert.equal(print, 'hello world!$>');
            parser2.clearPrintHandler();
            parser2.clearPrintHandler();
            clearAccu();
            parse(parser2, INPUT);
            chai_1.assert.equal(print, '');
        });
        it('ESC handler', () => {
            parser2.registerEscHandler({ intermediates: '%', final: 'G' }, function () {
                esc.push('%G');
                return true;
            });
            parser2.registerEscHandler({ final: 'E' }, function () {
                esc.push('E');
                return true;
            });
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(esc, ['%G', 'E']);
            parser2.clearEscHandler({ intermediates: '%', final: 'G' });
            parser2.clearEscHandler({ intermediates: '%', final: 'G' });
            clearAccu();
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(esc, ['E']);
            parser2.clearEscHandler({ final: 'E' });
            clearAccu();
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(esc, []);
        });
        describe('ESC custom handlers', () => {
            it('prevent fallback', () => {
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('default - %G'); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom - %G'); return true; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(esc, ['custom - %G']);
            });
            it('allow fallback', () => {
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('default - %G'); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom - %G'); return false; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(esc, ['custom - %G', 'default - %G']);
            });
            it('Multiple custom handlers fallback once', () => {
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('default - %G'); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom - %G'); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom2 - %G'); return false; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(esc, ['custom2 - %G', 'custom - %G']);
            });
            it('Multiple custom handlers no fallback', () => {
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('default - %G'); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom - %G'); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom2 - %G'); return true; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(esc, ['custom2 - %G']);
            });
            it('Execution order should go from latest handler down to the original', () => {
                const order = [];
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { order.push(1); return true; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { order.push(2); return false; });
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { order.push(3); return false; });
                parse(parser2, '\x1b%G');
                chai_1.assert.deepEqual(order, [3, 2, 1]);
            });
            it('Dispose should work', () => {
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('default - %G'); return true; });
                const dispo = parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom - %G'); return true; });
                dispo.dispose();
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(esc, ['default - %G']);
            });
            it('Should not corrupt the parser when dispose is called twice', () => {
                parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('default - %G'); return true; });
                const dispo = parser2.registerEscHandler({ intermediates: '%', final: 'G' }, () => { esc.push('custom - %G'); return true; });
                dispo.dispose();
                dispo.dispose();
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(esc, ['default - %G']);
            });
        });
        it('CSI handler', () => {
            parser2.registerCsiHandler({ final: 'm' }, function (params) {
                csi.push(['m', params.toArray(), '']);
                return true;
            });
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(csi, [['m', [1, 31], ''], ['m', [0], '']]);
            parser2.clearCsiHandler({ final: 'm' });
            parser2.clearCsiHandler({ final: 'm' });
            clearAccu();
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(csi, []);
        });
        describe('CSI custom handlers', () => {
            it('Prevent fallback', () => {
                const csiCustom = [];
                parser2.registerCsiHandler({ final: 'm' }, params => { csi.push(['m', params.toArray(), '']); return true; });
                parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom.push(['m', params.toArray(), '']); return true; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(csi, [], 'Should not fallback to original handler');
                chai_1.assert.deepEqual(csiCustom, [['m', [1, 31], ''], ['m', [0], '']]);
            });
            it('Allow fallback', () => {
                const csiCustom = [];
                parser2.registerCsiHandler({ final: 'm' }, params => { csi.push(['m', params.toArray(), '']); return true; });
                parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom.push(['m', params.toArray(), '']); return false; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(csi, [['m', [1, 31], ''], ['m', [0], '']], 'Should fallback to original handler');
                chai_1.assert.deepEqual(csiCustom, [['m', [1, 31], ''], ['m', [0], '']]);
            });
            it('Multiple custom handlers fallback once', () => {
                const csiCustom = [];
                const csiCustom2 = [];
                parser2.registerCsiHandler({ final: 'm' }, params => { csi.push(['m', params.toArray(), '']); return true; });
                parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom.push(['m', params.toArray(), '']); return true; });
                parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom2.push(['m', params.toArray(), '']); return false; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(csi, [], 'Should not fallback to original handler');
                chai_1.assert.deepEqual(csiCustom, [['m', [1, 31], ''], ['m', [0], '']]);
                chai_1.assert.deepEqual(csiCustom2, [['m', [1, 31], ''], ['m', [0], '']]);
            });
            it('Multiple custom handlers no fallback', () => {
                const csiCustom = [];
                const csiCustom2 = [];
                parser2.registerCsiHandler({ final: 'm' }, params => { csi.push(['m', params.toArray(), '']); return true; });
                parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom.push(['m', params.toArray(), '']); return true; });
                parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom2.push(['m', params.toArray(), '']); return true; });
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(csi, [], 'Should not fallback to original handler');
                chai_1.assert.deepEqual(csiCustom, [], 'Should not fallback once');
                chai_1.assert.deepEqual(csiCustom2, [['m', [1, 31], ''], ['m', [0], '']]);
            });
            it('Execution order should go from latest handler down to the original', () => {
                const order = [];
                parser2.registerCsiHandler({ final: 'm' }, () => { order.push(1); return true; });
                parser2.registerCsiHandler({ final: 'm' }, () => { order.push(2); return false; });
                parser2.registerCsiHandler({ final: 'm' }, () => { order.push(3); return false; });
                parse(parser2, '\x1b[0m');
                chai_1.assert.deepEqual(order, [3, 2, 1]);
            });
            it('Dispose should work', () => {
                const csiCustom = [];
                parser2.registerCsiHandler({ final: 'm' }, params => { csi.push(['m', params.toArray(), '']); return true; });
                const customHandler = parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom.push(['m', params.toArray(), '']); return true; });
                customHandler.dispose();
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(csi, [['m', [1, 31], ''], ['m', [0], '']]);
                chai_1.assert.deepEqual(csiCustom, [], 'Should not use custom handler as it was disposed');
            });
            it('Should not corrupt the parser when dispose is called twice', () => {
                const csiCustom = [];
                parser2.registerCsiHandler({ final: 'm' }, params => { csi.push(['m', params.toArray(), '']); return true; });
                const customHandler = parser2.registerCsiHandler({ final: 'm' }, params => { csiCustom.push(['m', params.toArray(), '']); return true; });
                customHandler.dispose();
                customHandler.dispose();
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(csi, [['m', [1, 31], ''], ['m', [0], '']]);
                chai_1.assert.deepEqual(csiCustom, [], 'Should not use custom handler as it was disposed');
            });
        });
        it('EXECUTE handler', () => {
            parser2.setExecuteHandler('\n', function () {
                exe.push('\n');
                return true;
            });
            parser2.setExecuteHandler('\r', function () {
                exe.push('\r');
                return true;
            });
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(exe, ['\r', '\n']);
            parser2.clearExecuteHandler('\r');
            parser2.clearExecuteHandler('\r');
            clearAccu();
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(exe, ['\n']);
        });
        it('OSC handler', () => {
            parser2.registerOscHandler(1, new OscParser_1.OscHandler(function (data) {
                osc.push([1, data]);
                return true;
            }));
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(osc, [[1, 'foo=bar']]);
            parser2.clearOscHandler(1);
            parser2.clearOscHandler(1);
            clearAccu();
            parse(parser2, INPUT);
            chai_1.assert.deepEqual(osc, []);
        });
        describe('OSC custom handlers', () => {
            it('Prevent fallback', () => {
                const oscCustom = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { osc.push([1, data]); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom.push([1, data]); return true; }));
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(osc, [], 'Should not fallback to original handler');
                chai_1.assert.deepEqual(oscCustom, [[1, 'foo=bar']]);
            });
            it('Allow fallback', () => {
                const oscCustom = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { osc.push([1, data]); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom.push([1, data]); return false; }));
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(osc, [[1, 'foo=bar']], 'Should fallback to original handler');
                chai_1.assert.deepEqual(oscCustom, [[1, 'foo=bar']]);
            });
            it('Multiple custom handlers fallback once', () => {
                const oscCustom = [];
                const oscCustom2 = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { osc.push([1, data]); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom.push([1, data]); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom2.push([1, data]); return false; }));
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(osc, [], 'Should not fallback to original handler');
                chai_1.assert.deepEqual(oscCustom, [[1, 'foo=bar']]);
                chai_1.assert.deepEqual(oscCustom2, [[1, 'foo=bar']]);
            });
            it('Multiple custom handlers no fallback', () => {
                const oscCustom = [];
                const oscCustom2 = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { osc.push([1, data]); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom.push([1, data]); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom2.push([1, data]); return true; }));
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(osc, [], 'Should not fallback to original handler');
                chai_1.assert.deepEqual(oscCustom, [], 'Should not fallback once');
                chai_1.assert.deepEqual(oscCustom2, [[1, 'foo=bar']]);
            });
            it('Execution order should go from latest handler down to the original', () => {
                const order = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(() => { order.push(1); return true; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(() => { order.push(2); return false; }));
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(() => { order.push(3); return false; }));
                parse(parser2, '\x1b]1;foo=bar\x1b\\');
                chai_1.assert.deepEqual(order, [3, 2, 1]);
            });
            it('Dispose should work', () => {
                const oscCustom = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { osc.push([1, data]); return true; }));
                const customHandler = parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom.push([1, data]); return true; }));
                customHandler.dispose();
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(osc, [[1, 'foo=bar']]);
                chai_1.assert.deepEqual(oscCustom, [], 'Should not use custom handler as it was disposed');
            });
            it('Should not corrupt the parser when dispose is called twice', () => {
                const oscCustom = [];
                parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { osc.push([1, data]); return true; }));
                const customHandler = parser2.registerOscHandler(1, new OscParser_1.OscHandler(data => { oscCustom.push([1, data]); return true; }));
                customHandler.dispose();
                customHandler.dispose();
                parse(parser2, INPUT);
                chai_1.assert.deepEqual(osc, [[1, 'foo=bar']]);
                chai_1.assert.deepEqual(oscCustom, [], 'Should not use custom handler as it was disposed');
            });
        });
        it('DCS handler', () => {
            parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, {
                hook: function (params) {
                    dcs.push(['hook', '', params.toArray(), 0]);
                },
                put: function (data, start, end) {
                    let s = '';
                    for (let i = start; i < end; ++i) {
                        s += (0, TextDecoder_1.stringFromCodePoint)(data[i]);
                    }
                    dcs.push(['put', s]);
                },
                unhook: function () {
                    dcs.push(['unhook']);
                    return true;
                }
            });
            parse(parser2, '\x1bP1;2;3+pabc');
            parse(parser2, ';de\x9c');
            chai_1.assert.deepEqual(dcs, [
                ['hook', '', [1, 2, 3], 0],
                ['put', 'abc'], ['put', ';de'],
                ['unhook']
            ]);
            parser2.clearDcsHandler({ intermediates: '+', final: 'p' });
            parser2.clearDcsHandler({ intermediates: '+', final: 'p' });
            clearAccu();
            parse(parser2, '\x1bP1;2;3+pabc');
            parse(parser2, ';de\x9c');
            chai_1.assert.deepEqual(dcs, []);
        });
        describe('DCS custom handlers', () => {
            const DCS_INPUT = '\x1bP1;2;3+pabc\x1b\\';
            it('Prevent fallback', () => {
                const dcsCustom = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['A', params.toArray(), data]); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['B', params.toArray(), data]); return true; }));
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(dcsCustom, [['B', [1, 2, 3], 'abc']]);
            });
            it('Allow fallback', () => {
                const dcsCustom = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['A', params.toArray(), data]); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['B', params.toArray(), data]); return false; }));
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(dcsCustom, [['B', [1, 2, 3], 'abc'], ['A', [1, 2, 3], 'abc']]);
            });
            it('Multiple custom handlers fallback once', () => {
                const dcsCustom = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['A', params.toArray(), data]); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['B', params.toArray(), data]); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['C', params.toArray(), data]); return false; }));
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(dcsCustom, [['C', [1, 2, 3], 'abc'], ['B', [1, 2, 3], 'abc']]);
            });
            it('Multiple custom handlers no fallback', () => {
                const dcsCustom = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['A', params.toArray(), data]); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['B', params.toArray(), data]); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['C', params.toArray(), data]); return true; }));
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(dcsCustom, [['C', [1, 2, 3], 'abc']]);
            });
            it('Execution order should go from latest handler down to the original', () => {
                const order = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler(() => { order.push(1); return true; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler(() => { order.push(2); return false; }));
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler(() => { order.push(3); return false; }));
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(order, [3, 2, 1]);
            });
            it('Dispose should work', () => {
                const dcsCustom = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['A', params.toArray(), data]); return true; }));
                const dispo = parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['B', params.toArray(), data]); return true; }));
                dispo.dispose();
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(dcsCustom, [['A', [1, 2, 3], 'abc']]);
            });
            it('Should not corrupt the parser when dispose is called twice', () => {
                const dcsCustom = [];
                parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['A', params.toArray(), data]); return true; }));
                const dispo = parser2.registerDcsHandler({ intermediates: '+', final: 'p' }, new DcsParser_1.DcsHandler((data, params) => { dcsCustom.push(['B', params.toArray(), data]); return true; }));
                dispo.dispose();
                dispo.dispose();
                parse(parser2, DCS_INPUT);
                chai_1.assert.deepEqual(dcsCustom, [['A', [1, 2, 3], 'abc']]);
            });
        });
        it('ERROR handler', () => {
            let errorState = null;
            parser2.setErrorHandler(function (state) {
                errorState = state;
                return state;
            });
            parse(parser2, '\x1b[1;2;€;3m');
            chai_1.assert.deepEqual(errorState, {
                position: 6,
                code: '€'.charCodeAt(0),
                currentState: 4,
                collect: 0,
                params: Params_1.Params.fromArray([1, 2, 0]),
                abort: false
            });
            parser2.clearErrorHandler();
            parser2.clearErrorHandler();
            errorState = null;
            parse(parser2, '\x1b[1;2;a;3m');
            chai_1.assert.equal(errorState, null);
        });
    });
    describe('function identifiers', () => {
        describe('registration limits', () => {
            it('prefix range 0x3c .. 0x3f, one byte', () => {
                for (let i = 0x3c; i <= 0x3f; ++i) {
                    const c = String.fromCharCode(i);
                    chai_1.assert.equal(parser.identToString(parser.identifier({ prefix: c, final: 'z' })), c + 'z');
                }
                chai_1.assert.throws(() => { parser.identifier({ prefix: '\x3b', final: 'z' }); }, 'prefix must be in range 0x3c .. 0x3f');
                chai_1.assert.throws(() => { parser.identifier({ prefix: '\x40', final: 'z' }); }, 'prefix must be in range 0x3c .. 0x3f');
                chai_1.assert.throws(() => { parser.identifier({ prefix: '??', final: 'z' }); }, 'only one byte as prefix supported');
            });
            it('intermediates range 0x20 .. 0x2f, up to two bytes', () => {
                for (let i = 0x20; i <= 0x2f; ++i) {
                    const c = String.fromCharCode(i);
                    chai_1.assert.equal(parser.identToString(parser.identifier({ intermediates: c + c, final: 'z' })), c + c + 'z');
                }
                chai_1.assert.throws(() => { parser.identifier({ intermediates: '\x1f', final: 'z' }); }, 'intermediate must be in range 0x20 .. 0x2f');
                chai_1.assert.throws(() => { parser.identifier({ intermediates: '\x30', final: 'z' }); }, 'intermediate must be in range 0x20 .. 0x2f');
                chai_1.assert.throws(() => { parser.identifier({ intermediates: '!!!', final: 'z' }); }, 'only two bytes as intermediates are supported');
            });
            it('final CSI/DCS range 0x40 .. 0x7e (default), one byte', () => {
                for (let i = 0x40; i <= 0x7e; ++i) {
                    const c = String.fromCharCode(i);
                    chai_1.assert.equal(parser.identToString(parser.identifier({ final: c })), c);
                }
                chai_1.assert.throws(() => { parser.identifier({ final: '\x3f' }); }, 'final must be in range 64 .. 126');
                chai_1.assert.throws(() => { parser.identifier({ final: '\x7f' }); }, 'final must be in range 64 .. 126');
                chai_1.assert.throws(() => { parser.identifier({ final: 'zz' }); }, 'final must be a single byte');
            });
            it('final ESC range 0x30 .. 0x7e, one byte', () => {
                for (let i = 0x30; i <= 0x7e; ++i) {
                    const final = String.fromCharCode(i);
                    let handler;
                    chai_1.assert.doesNotThrow(() => { handler = parser.registerEscHandler({ final }, () => true); }, 'final must be in range 48 .. 126');
                    if (handler)
                        handler.dispose();
                }
                chai_1.assert.throws(() => { parser.registerEscHandler({ final: '\x2f' }, () => true); }, 'final must be in range 48 .. 126');
                chai_1.assert.throws(() => { parser.registerEscHandler({ final: '\x7f' }, () => true); }, 'final must be in range 48 .. 126');
            });
            it('id calculation - should stacking prefix -> intermediate -> final', () => {
                chai_1.assert.equal(parser.identToString(parser.identifier({ final: 'z' })), 'z');
                chai_1.assert.equal(parser.identToString(parser.identifier({ prefix: '?', final: 'z' })), '?z');
                chai_1.assert.equal(parser.identToString(parser.identifier({ intermediates: '!', final: 'z' })), '!z');
                chai_1.assert.equal(parser.identToString(parser.identifier({ prefix: '?', intermediates: '!', final: 'z' })), '?!z');
                chai_1.assert.equal(parser.identToString(parser.identifier({ prefix: '?', intermediates: '!!', final: 'z' })), '?!!z');
            });
        });
        describe('identifier invocation', () => {
            it('ESC', () => {
                const callstack = [];
                const h1 = parser.registerEscHandler({ final: 'z' }, () => { callstack.push('z'); return true; });
                const h2 = parser.registerEscHandler({ intermediates: '!', final: 'z' }, () => { callstack.push('!z'); return true; });
                const h3 = parser.registerEscHandler({ intermediates: '!!', final: 'z' }, () => { callstack.push('!!z'); return true; });
                parse(parser, '\x1bz\x1b!z\x1b!!z');
                h1.dispose();
                h2.dispose();
                h3.dispose();
                parse(parser, '\x1bz\x1b!z\x1b!!z');
                chai_1.assert.deepEqual(callstack, ['z', '!z', '!!z']);
            });
            it('CSI', () => {
                const callstack = [];
                const h1 = parser.registerCsiHandler({ final: 'z' }, params => { callstack.push(['z', params.toArray()]); return true; });
                const h2 = parser.registerCsiHandler({ intermediates: '!', final: 'z' }, params => { callstack.push(['!z', params.toArray()]); return true; });
                const h3 = parser.registerCsiHandler({ intermediates: '!!', final: 'z' }, params => { callstack.push(['!!z', params.toArray()]); return true; });
                const h4 = parser.registerCsiHandler({ prefix: '?', final: 'z' }, params => { callstack.push(['?z', params.toArray()]); return true; });
                const h5 = parser.registerCsiHandler({ prefix: '?', intermediates: '!', final: 'z' }, params => { callstack.push(['?!z', params.toArray()]); return true; });
                const h6 = parser.registerCsiHandler({ prefix: '?', intermediates: '!!', final: 'z' }, params => { callstack.push(['?!!z', params.toArray()]); return true; });
                parse(parser, '\x1b[1;z\x1b[1;!z\x1b[1;!!z\x1b[?1;z\x1b[?1;!z\x1b[?1;!!z');
                h1.dispose();
                h2.dispose();
                h3.dispose();
                h4.dispose();
                h5.dispose();
                h6.dispose();
                parse(parser, '\x1b[1;z\x1b[1;!z\x1b[1;!!z\x1b[?1;z\x1b[?1;!z\x1b[?1;!!z');
                chai_1.assert.deepEqual(callstack, [['z', [1, 0]], ['!z', [1, 0]], ['!!z', [1, 0]], ['?z', [1, 0]], ['?!z', [1, 0]], ['?!!z', [1, 0]]]);
            });
            it('DCS', () => {
                const callstack = [];
                const h1 = parser.registerDcsHandler({ final: 'z' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['z', params.toArray(), data]); return true; }));
                const h2 = parser.registerDcsHandler({ intermediates: '!', final: 'z' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['!z', params.toArray(), data]); return true; }));
                const h3 = parser.registerDcsHandler({ intermediates: '!!', final: 'z' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['!!z', params.toArray(), data]); return true; }));
                const h4 = parser.registerDcsHandler({ prefix: '?', final: 'z' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['?z', params.toArray(), data]); return true; }));
                const h5 = parser.registerDcsHandler({ prefix: '?', intermediates: '!', final: 'z' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['?!z', params.toArray(), data]); return true; }));
                const h6 = parser.registerDcsHandler({ prefix: '?', intermediates: '!!', final: 'z' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['?!!z', params.toArray(), data]); return true; }));
                parse(parser, '\x1bP1;zAB\x1b\\\x1bP1;!zAB\x1b\\\x1bP1;!!zAB\x1b\\\x1bP?1;zAB\x1b\\\x1bP?1;!zAB\x1b\\\x1bP?1;!!zAB\x1b\\');
                h1.dispose();
                h2.dispose();
                h3.dispose();
                h4.dispose();
                h5.dispose();
                h6.dispose();
                parse(parser, '\x1bP1;zAB\x1b\\\x1bP1;!zAB\x1b\\\x1bP1;!!zAB\x1b\\\x1bP?1;zAB\x1b\\\x1bP?1;!zAB\x1b\\\x1bP?1;!!zAB\x1b\\');
                chai_1.assert.deepEqual(callstack, [
                    ['z', [1, 0], 'AB'],
                    ['!z', [1, 0], 'AB'],
                    ['!!z', [1, 0], 'AB'],
                    ['?z', [1, 0], 'AB'],
                    ['?!z', [1, 0], 'AB'],
                    ['?!!z', [1, 0], 'AB']
                ]);
            });
        });
    });
});
function parseSync(parser, data) {
    const container = new Uint32Array(data.length);
    const decoder = new TextDecoder_1.StringToUtf32();
    return parser.parse(container, decoder.decode(data, container));
}
async function parseP(parser, data) {
    const container = new Uint32Array(data.length);
    const decoder = new TextDecoder_1.StringToUtf32();
    const len = decoder.decode(data, container);
    let result;
    let prev;
    while (result = parser.parse(container, len, prev)) {
        prev = await result;
    }
}
function evalStackSaves(stackSaves, data) {
    chai_1.assert.equal(stackSaves.length, data.length);
    for (let i = 0; i < data.length; ++i) {
        chai_1.assert.equal(stackSaves[i].chunkPos, data[i][0]);
        chai_1.assert.equal(stackSaves[i].state, data[i][1]);
        chai_1.assert.equal(stackSaves[i].handlerPos, data[i][2]);
    }
}
async function throwsAsync(fn, message) {
    let msg;
    try {
        await fn();
    }
    catch (e) {
        if (e instanceof Error) {
            msg = e.message;
        }
        else if (typeof e === 'string') {
            msg = e;
        }
        if (typeof message === 'string') {
            chai_1.assert.equal(msg, message);
        }
        return;
    }
    chai_1.assert.throws(fn, message);
}
describe('EscapeSequenceParser - async', () => {
    const INPUT = '\x1b[1;31mhello \x1b%Gwor\x1bEld!\x1b[0m\r\n$>\x1bP1;2axyz\x1b\\\x1b]1;foo=bar\x1b\\FIN';
    let RESULT;
    let parser;
    const callstack = [];
    function clearAccu() {
        callstack.length = 0;
        parser.trackedStack.length = 0;
    }
    beforeEach(() => {
        RESULT = [
            ['SGR', [1, 31]],
            ['PRINT', 'hello '],
            ['ESC %G'],
            ['PRINT', 'wor'],
            ['ESC E'],
            ['PRINT', 'ld!'],
            ['SGR', [0]],
            ['EXE \r'],
            ['EXE \n'],
            ['PRINT', '$>'],
            ['DCS a', ['xyz', [1, 2]]],
            ['OSC 1', 'foo=bar'],
            ['PRINT', 'FIN']
        ];
        parser = new TestEscapeSequenceParser();
        parser.reset();
        parser.trackStackSavesOnPause();
        clearAccu();
    });
    describe('sync handlers should behave as before', () => {
        beforeEach(() => {
            parser.setPrintHandler((data, start, end) => {
                let result = '';
                for (let i = start; i < end; ++i) {
                    result += (0, TextDecoder_1.stringFromCodePoint)(data[i]);
                }
                callstack.push(['PRINT', result]);
            });
            parser.registerCsiHandler({ final: 'm' }, params => { callstack.push(['SGR', params.toArray()]); return true; });
            parser.registerEscHandler({ intermediates: '%', final: 'G' }, () => { callstack.push(['ESC %G']); return true; });
            parser.registerEscHandler({ final: 'E' }, () => { callstack.push(['ESC E']); return true; });
            parser.setExecuteHandler('\r', () => { callstack.push(['EXE \r']); return true; });
            parser.setExecuteHandler('\n', () => { callstack.push(['EXE \n']); return true; });
            parser.registerOscHandler(1, new OscParser_1.OscHandler(data => { callstack.push(['OSC 1', data]); return true; }));
            parser.registerDcsHandler({ final: 'a' }, new DcsParser_1.DcsHandler((data, params) => { callstack.push(['DCS a', [data, params.toArray()]]); return true; }));
        });
        it('sync handlers keep being parsed in sync mode', () => {
            chai_1.assert.equal(!parseSync(parser, INPUT), true);
            chai_1.assert.equal(parser.parseStack.state, 0);
            chai_1.assert.equal(parser.trackedStack.length, 0);
        });
        it('correct result on sync parse call', () => {
            parseSync(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT);
            chai_1.assert.equal(parser.trackedStack.length, 0);
        });
        it('correct result on async parse call', async () => {
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT);
            chai_1.assert.equal(parser.trackedStack.length, 0);
        });
    });
    describe('async handlers', () => {
        beforeEach(() => {
            parser.setPrintHandler((data, start, end) => {
                let result = '';
                for (let i = start; i < end; ++i) {
                    result += (0, TextDecoder_1.stringFromCodePoint)(data[i]);
                }
                callstack.push(['PRINT', result]);
            });
            parser.registerCsiHandler({ final: 'm' }, async (params) => { callstack.push(['SGR', params.toArray()]); return true; });
            parser.registerEscHandler({ intermediates: '%', final: 'G' }, async () => { callstack.push(['ESC %G']); return true; });
            parser.registerEscHandler({ final: 'E' }, async () => { callstack.push(['ESC E']); return true; });
            parser.setExecuteHandler('\r', () => { callstack.push(['EXE \r']); return true; });
            parser.setExecuteHandler('\n', () => { callstack.push(['EXE \n']); return true; });
            parser.registerOscHandler(1, new OscParser_1.OscHandler(async (data) => { callstack.push(['OSC 1', data]); return true; }));
            parser.registerDcsHandler({ final: 'a' }, new DcsParser_1.DcsHandler(async (data, params) => { callstack.push(['DCS a', [data, params.toArray()]]); return true; }));
        });
        it('sync parse call does not work anymore', () => {
            chai_1.assert.notEqual(!parseSync(parser, INPUT), true);
            chai_1.assert.notDeepEqual(callstack, RESULT);
            chai_1.assert.equal(parser.trackedStack.length, 1);
        });
        it('improper continuation should throw', async () => {
            chai_1.assert.notEqual(!parseSync(parser, INPUT), true);
            chai_1.assert.notDeepEqual(callstack, RESULT);
            chai_1.assert.throws(() => parseSync(parser, INPUT), 'improper continuation due to previous async handler, giving up parsing');
            chai_1.assert.throws(() => parseSync(parser, 'random'), 'improper continuation due to previous async handler, giving up parsing');
            await throwsAsync(() => parseP(parser, 'foobar'), 'improper continuation due to previous async handler, giving up parsing');
            parser.reset();
            await parseP(parser, INPUT);
        });
        it('correct result on awaited parse call', async () => {
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT);
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
        });
        it('correct result on chunked awaited parse calls', async () => {
            RESULT = [
                ['SGR', [1, 31]],
                ['PRINT', 'h'],
                ['PRINT', 'e'],
                ['PRINT', 'l'],
                ['PRINT', 'l'],
                ['PRINT', 'o'],
                ['PRINT', ' '],
                ['ESC %G'],
                ['PRINT', 'w'],
                ['PRINT', 'o'],
                ['PRINT', 'r'],
                ['ESC E'],
                ['PRINT', 'l'],
                ['PRINT', 'd'],
                ['PRINT', '!'],
                ['SGR', [0]],
                ['EXE \r'],
                ['EXE \n'],
                ['PRINT', '$'],
                ['PRINT', '>'],
                ['DCS a', ['xyz', [1, 2]]],
                ['OSC 1', 'foo=bar'],
                ['PRINT', 'F'],
                ['PRINT', 'I'],
                ['PRINT', 'N']
            ];
            for (let i = 0; i < INPUT.length; ++i) {
                await parseP(parser, INPUT[i]);
            }
            chai_1.assert.deepEqual(callstack, RESULT);
            evalStackSaves(parser.trackedStack, [
                [0, 3, 0],
                [0, 4, 0],
                [0, 4, 0],
                [0, 3, 0],
                [0, 6, 0],
                [0, 5, 0]
            ]);
        });
        it('multiple async SGR handlers', async () => {
            const SGR2 = parser.registerCsiHandler({ final: 'm' }, async (params) => { callstack.push(['2# SGR', params.toArray()]); return false; });
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# SGR')
                    chai_1.assert.equal(callstack[i + 1][0], 'SGR', 'Should fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 1],
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 1],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            SGR2.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            const SGR22 = parser.registerCsiHandler({ final: 'm' }, async (params) => { callstack.push(['2# SGR', params.toArray()]); return true; });
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# SGR')
                    chai_1.assert.notEqual(callstack[i + 1][0], 'SGR', 'Should not fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 1],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 1],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            SGR22.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
        });
        it('multiple async ESC handlers', async () => {
            const ESC2 = parser.registerEscHandler({ final: 'E' }, async () => { callstack.push(['2# ESC E']); return false; });
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# ESC E')
                    chai_1.assert.equal(callstack[i + 1][0], 'ESC E', 'Should fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 1],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            ESC2.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            const ESC22 = parser.registerEscHandler({ final: 'E' }, async () => { callstack.push(['2# ESC E']); return true; });
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# ESC E')
                    chai_1.assert.notEqual(callstack[i + 1][0], 'ESC E', 'Should not fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 1],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            ESC22.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
        });
        it('sync/async SGR mixed', async () => {
            const SGR2 = parser.registerCsiHandler({ final: 'm' }, params => { callstack.push(['2# SGR', params.toArray()]); return false; });
            const SGR3 = parser.registerCsiHandler({ final: 'm' }, async (params) => { callstack.push(['3# SGR', params.toArray()]); return false; });
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '3# SGR') {
                    chai_1.assert.equal(callstack[i + 1][0], '2# SGR', 'Should fallback to next handler');
                    chai_1.assert.equal(callstack[i + 2][0], 'SGR', 'Should fallback to original handler');
                }
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 2],
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 2],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            SGR2.dispose();
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '3# SGR') {
                    chai_1.assert.equal(callstack[i + 1][0], 'SGR', 'Should fallback to original handler');
                }
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 1],
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 1],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            SGR3.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
        });
        it('multiple async OSC handlers', async () => {
            const OSC2 = parser.registerOscHandler(1, new OscParser_1.OscHandler(async (data) => { callstack.push(['2# OSC 1', data]); return false; }));
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# OSC 1')
                    chai_1.assert.equal(callstack[i + 1][0], 'OSC 1', 'Should fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            OSC2.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            const OSC22 = parser.registerOscHandler(1, new OscParser_1.OscHandler(async (data) => { callstack.push(['2# OSC 1', data]); return true; }));
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# OSC 1')
                    chai_1.assert.notEqual(callstack[i + 1][0], 'OSC 1', 'Should fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            OSC22.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
        });
        it('multiple async DCS handlers', async () => {
            const DCS2 = parser.registerDcsHandler({ final: 'a' }, new DcsParser_1.DcsHandler(async (data, params) => { callstack.push(['#2 DCS a', [data, params.toArray()]]); return false; }));
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# DCS a')
                    chai_1.assert.equal(callstack[i + 1][0], 'DCS a', 'Should fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            DCS2.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            const DCS22 = parser.registerDcsHandler({ final: 'a' }, new DcsParser_1.DcsHandler(async (data, params) => { callstack.push(['#2 DCS a', [data, params.toArray()]]); return true; }));
            await parseP(parser, INPUT);
            for (let i = 0; i < callstack.length; ++i) {
                const entry = callstack[i];
                if (entry[0] === '2# DCS a')
                    chai_1.assert.notEqual(callstack[i + 1][0], 'DCS a', 'Should fallback to original handler');
            }
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
            DCS22.dispose();
            await parseP(parser, INPUT);
            chai_1.assert.deepEqual(callstack, RESULT, 'Should not call custom handler');
            evalStackSaves(parser.trackedStack, [
                [6, 3, 0],
                [15, 4, 0],
                [20, 4, 0],
                [27, 3, 0],
                [41, 6, 0],
                [54, 5, 0]
            ]);
            clearAccu();
        });
    });
});
//# sourceMappingURL=EscapeSequenceParser.test.js.map