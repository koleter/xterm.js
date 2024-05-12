"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlyphRenderer = void 0;
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const TextureAtlas_1 = require("browser/renderer/shared/TextureAtlas");
const Constants_1 = require("common/buffer/Constants");
const Lifecycle_1 = require("common/Lifecycle");
const WebglUtils_1 = require("./WebglUtils");
const vertexShaderSource = `#version 300 es
layout (location = ${0}) in vec2 a_unitquad;
layout (location = ${1}) in vec2 a_cellpos;
layout (location = ${2}) in vec2 a_offset;
layout (location = ${3}) in vec2 a_size;
layout (location = ${4}) in float a_texpage;
layout (location = ${5}) in vec2 a_texcoord;
layout (location = ${6}) in vec2 a_texsize;

uniform mat4 u_projection;
uniform vec2 u_resolution;

out vec2 v_texcoord;
flat out int v_texpage;

void main() {
  vec2 zeroToOne = (a_offset / u_resolution) + a_cellpos + (a_unitquad * a_size);
  gl_Position = u_projection * vec4(zeroToOne, 0.0, 1.0);
  v_texpage = int(a_texpage);
  v_texcoord = a_texcoord + a_unitquad * a_texsize;
}`;
function createFragmentShaderSource(maxFragmentShaderTextureUnits) {
    let textureConditionals = '';
    for (let i = 1; i < maxFragmentShaderTextureUnits; i++) {
        textureConditionals += ` else if (v_texpage == ${i}) { outColor = texture(u_texture[${i}], v_texcoord); }`;
    }
    return (`#version 300 es
precision lowp float;

in vec2 v_texcoord;
flat in int v_texpage;

uniform sampler2D u_texture[${maxFragmentShaderTextureUnits}];

out vec4 outColor;

void main() {
  if (v_texpage == 0) {
    outColor = texture(u_texture[0], v_texcoord);
  } ${textureConditionals}
}`);
}
const INDICES_PER_CELL = 11;
const BYTES_PER_CELL = INDICES_PER_CELL * Float32Array.BYTES_PER_ELEMENT;
const CELL_POSITION_INDICES = 2;
let $i = 0;
let $glyph = undefined;
let $leftCellPadding = 0;
let $clippedPixels = 0;
class GlyphRenderer extends Lifecycle_1.Disposable {
    constructor(_terminal, _gl, _dimensions, _optionsService) {
        super();
        this._terminal = _terminal;
        this._gl = _gl;
        this._dimensions = _dimensions;
        this._optionsService = _optionsService;
        this._activeBuffer = 0;
        this._vertices = {
            count: 0,
            attributes: new Float32Array(0),
            attributesBuffers: [
                new Float32Array(0),
                new Float32Array(0)
            ]
        };
        const gl = this._gl;
        if (TextureAtlas_1.TextureAtlas.maxAtlasPages === undefined) {
            TextureAtlas_1.TextureAtlas.maxAtlasPages = Math.min(32, (0, RendererUtils_1.throwIfFalsy)(gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)));
            TextureAtlas_1.TextureAtlas.maxTextureSize = (0, RendererUtils_1.throwIfFalsy)(gl.getParameter(gl.MAX_TEXTURE_SIZE));
        }
        this._program = (0, RendererUtils_1.throwIfFalsy)((0, WebglUtils_1.createProgram)(gl, vertexShaderSource, createFragmentShaderSource(TextureAtlas_1.TextureAtlas.maxAtlasPages)));
        this.register((0, Lifecycle_1.toDisposable)(() => gl.deleteProgram(this._program)));
        this._projectionLocation = (0, RendererUtils_1.throwIfFalsy)(gl.getUniformLocation(this._program, 'u_projection'));
        this._resolutionLocation = (0, RendererUtils_1.throwIfFalsy)(gl.getUniformLocation(this._program, 'u_resolution'));
        this._textureLocation = (0, RendererUtils_1.throwIfFalsy)(gl.getUniformLocation(this._program, 'u_texture'));
        this._vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(this._vertexArrayObject);
        const unitQuadVertices = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
        const unitQuadVerticesBuffer = gl.createBuffer();
        this.register((0, Lifecycle_1.toDisposable)(() => gl.deleteBuffer(unitQuadVerticesBuffer)));
        gl.bindBuffer(gl.ARRAY_BUFFER, unitQuadVerticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, unitQuadVertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 0, 0);
        const unitQuadElementIndices = new Uint8Array([0, 1, 2, 3]);
        const elementIndicesBuffer = gl.createBuffer();
        this.register((0, Lifecycle_1.toDisposable)(() => gl.deleteBuffer(elementIndicesBuffer)));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, unitQuadElementIndices, gl.STATIC_DRAW);
        this._attributesBuffer = (0, RendererUtils_1.throwIfFalsy)(gl.createBuffer());
        this.register((0, Lifecycle_1.toDisposable)(() => gl.deleteBuffer(this._attributesBuffer)));
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, BYTES_PER_CELL, 0);
        gl.vertexAttribDivisor(2, 1);
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, BYTES_PER_CELL, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(3, 1);
        gl.enableVertexAttribArray(4);
        gl.vertexAttribPointer(4, 1, gl.FLOAT, false, BYTES_PER_CELL, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(4, 1);
        gl.enableVertexAttribArray(5);
        gl.vertexAttribPointer(5, 2, gl.FLOAT, false, BYTES_PER_CELL, 5 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(5, 1);
        gl.enableVertexAttribArray(6);
        gl.vertexAttribPointer(6, 2, gl.FLOAT, false, BYTES_PER_CELL, 7 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(6, 1);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, BYTES_PER_CELL, 9 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribDivisor(1, 1);
        gl.useProgram(this._program);
        const textureUnits = new Int32Array(TextureAtlas_1.TextureAtlas.maxAtlasPages);
        for (let i = 0; i < TextureAtlas_1.TextureAtlas.maxAtlasPages; i++) {
            textureUnits[i] = i;
        }
        gl.uniform1iv(this._textureLocation, textureUnits);
        gl.uniformMatrix4fv(this._projectionLocation, false, WebglUtils_1.PROJECTION_MATRIX);
        this._atlasTextures = [];
        for (let i = 0; i < TextureAtlas_1.TextureAtlas.maxAtlasPages; i++) {
            const glTexture = new WebglUtils_1.GLTexture((0, RendererUtils_1.throwIfFalsy)(gl.createTexture()));
            this.register((0, Lifecycle_1.toDisposable)(() => gl.deleteTexture(glTexture.texture)));
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, glTexture.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
            this._atlasTextures[i] = glTexture;
        }
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.handleResize();
    }
    beginFrame() {
        return this._atlas ? this._atlas.beginFrame() : true;
    }
    updateCell(x, y, code, bg, fg, ext, chars, width, lastBg) {
        this._updateCell(this._vertices.attributes, x, y, code, bg, fg, ext, chars, width, lastBg);
    }
    _updateCell(array, x, y, code, bg, fg, ext, chars, width, lastBg) {
        $i = (y * this._terminal.cols + x) * INDICES_PER_CELL;
        if (code === Constants_1.NULL_CELL_CODE || code === undefined) {
            array.fill(0, $i, $i + INDICES_PER_CELL - 1 - CELL_POSITION_INDICES);
            return;
        }
        if (!this._atlas) {
            return;
        }
        if (chars && chars.length > 1) {
            $glyph = this._atlas.getRasterizedGlyphCombinedChar(chars, bg, fg, ext, false);
        }
        else {
            $glyph = this._atlas.getRasterizedGlyph(code, bg, fg, ext, false);
        }
        $leftCellPadding = Math.floor((this._dimensions.device.cell.width - this._dimensions.device.char.width) / 2);
        if (bg !== lastBg && $glyph.offset.x > $leftCellPadding) {
            $clippedPixels = $glyph.offset.x - $leftCellPadding;
            array[$i] = -($glyph.offset.x - $clippedPixels) + this._dimensions.device.char.left;
            array[$i + 1] = -$glyph.offset.y + this._dimensions.device.char.top;
            array[$i + 2] = ($glyph.size.x - $clippedPixels) / this._dimensions.device.canvas.width;
            array[$i + 3] = $glyph.size.y / this._dimensions.device.canvas.height;
            array[$i + 4] = $glyph.texturePage;
            array[$i + 5] = $glyph.texturePositionClipSpace.x + $clippedPixels / this._atlas.pages[$glyph.texturePage].canvas.width;
            array[$i + 6] = $glyph.texturePositionClipSpace.y;
            array[$i + 7] = $glyph.sizeClipSpace.x - $clippedPixels / this._atlas.pages[$glyph.texturePage].canvas.width;
            array[$i + 8] = $glyph.sizeClipSpace.y;
        }
        else {
            array[$i] = -$glyph.offset.x + this._dimensions.device.char.left;
            array[$i + 1] = -$glyph.offset.y + this._dimensions.device.char.top;
            array[$i + 2] = $glyph.size.x / this._dimensions.device.canvas.width;
            array[$i + 3] = $glyph.size.y / this._dimensions.device.canvas.height;
            array[$i + 4] = $glyph.texturePage;
            array[$i + 5] = $glyph.texturePositionClipSpace.x;
            array[$i + 6] = $glyph.texturePositionClipSpace.y;
            array[$i + 7] = $glyph.sizeClipSpace.x;
            array[$i + 8] = $glyph.sizeClipSpace.y;
        }
        if (this._optionsService.rawOptions.rescaleOverlappingGlyphs) {
            if ((0, RendererUtils_1.allowRescaling)(code, width, $glyph.size.x, this._dimensions.device.cell.width)) {
                array[$i + 2] = (this._dimensions.device.cell.width - 1) / this._dimensions.device.canvas.width;
            }
        }
    }
    clear() {
        const terminal = this._terminal;
        const newCount = terminal.cols * terminal.rows * INDICES_PER_CELL;
        if (this._vertices.count !== newCount) {
            this._vertices.attributes = new Float32Array(newCount);
        }
        else {
            this._vertices.attributes.fill(0);
        }
        let i = 0;
        for (; i < this._vertices.attributesBuffers.length; i++) {
            if (this._vertices.count !== newCount) {
                this._vertices.attributesBuffers[i] = new Float32Array(newCount);
            }
            else {
                this._vertices.attributesBuffers[i].fill(0);
            }
        }
        this._vertices.count = newCount;
        i = 0;
        for (let y = 0; y < terminal.rows; y++) {
            for (let x = 0; x < terminal.cols; x++) {
                this._vertices.attributes[i + 9] = x / terminal.cols;
                this._vertices.attributes[i + 10] = y / terminal.rows;
                i += INDICES_PER_CELL;
            }
        }
    }
    handleResize() {
        const gl = this._gl;
        gl.useProgram(this._program);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.uniform2f(this._resolutionLocation, gl.canvas.width, gl.canvas.height);
        this.clear();
    }
    render(renderModel) {
        if (!this._atlas) {
            return;
        }
        const gl = this._gl;
        gl.useProgram(this._program);
        gl.bindVertexArray(this._vertexArrayObject);
        this._activeBuffer = (this._activeBuffer + 1) % 2;
        const activeBuffer = this._vertices.attributesBuffers[this._activeBuffer];
        let bufferLength = 0;
        for (let y = 0; y < renderModel.lineLengths.length; y++) {
            const si = y * this._terminal.cols * INDICES_PER_CELL;
            const sub = this._vertices.attributes.subarray(si, si + renderModel.lineLengths[y] * INDICES_PER_CELL);
            activeBuffer.set(sub, bufferLength);
            bufferLength += sub.length;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, activeBuffer.subarray(0, bufferLength), gl.STREAM_DRAW);
        for (let i = 0; i < this._atlas.pages.length; i++) {
            if (this._atlas.pages[i].version !== this._atlasTextures[i].version) {
                this._bindAtlasPageTexture(gl, this._atlas, i);
            }
        }
        gl.drawElementsInstanced(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_BYTE, 0, bufferLength / INDICES_PER_CELL);
    }
    setAtlas(atlas) {
        this._atlas = atlas;
        for (const glTexture of this._atlasTextures) {
            glTexture.version = -1;
        }
    }
    _bindAtlasPageTexture(gl, atlas, i) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, this._atlasTextures[i].texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.pages[i].canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        this._atlasTextures[i].version = atlas.pages[i].version;
    }
    setDimensions(dimensions) {
        this._dimensions = dimensions;
    }
}
exports.GlyphRenderer = GlyphRenderer;
//# sourceMappingURL=GlyphRenderer.js.map