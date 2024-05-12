"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLTexture = exports.expandFloat32Array = exports.createShader = exports.createProgram = exports.PROJECTION_MATRIX = void 0;
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
exports.PROJECTION_MATRIX = new Float32Array([
    2, 0, 0, 0,
    0, -2, 0, 0,
    0, 0, 1, 0,
    -1, 1, 0, 1
]);
function createProgram(gl, vertexSource, fragmentSource) {
    const program = (0, RendererUtils_1.throwIfFalsy)(gl.createProgram());
    gl.attachShader(program, (0, RendererUtils_1.throwIfFalsy)(createShader(gl, gl.VERTEX_SHADER, vertexSource)));
    gl.attachShader(program, (0, RendererUtils_1.throwIfFalsy)(createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)));
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
exports.createProgram = createProgram;
function createShader(gl, type, source) {
    const shader = (0, RendererUtils_1.throwIfFalsy)(gl.createShader(type));
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}
exports.createShader = createShader;
function expandFloat32Array(source, max) {
    const newLength = Math.min(source.length * 2, max);
    const newArray = new Float32Array(newLength);
    for (let i = 0; i < source.length; i++) {
        newArray[i] = source[i];
    }
    return newArray;
}
exports.expandFloat32Array = expandFloat32Array;
class GLTexture {
    constructor(texture) {
        this.texture = texture;
        this.version = -1;
    }
}
exports.GLTexture = GLTexture;
//# sourceMappingURL=WebglUtils.js.map