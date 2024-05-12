"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidthCache = void 0;
class WidthCache {
    constructor(_document, _helperContainer) {
        this._flat = new Float32Array(256);
        this._font = '';
        this._fontSize = 0;
        this._weight = 'normal';
        this._weightBold = 'bold';
        this._measureElements = [];
        this._container = _document.createElement('div');
        this._container.classList.add('xterm-width-cache-measure-container');
        this._container.setAttribute('aria-hidden', 'true');
        this._container.style.whiteSpace = 'pre';
        this._container.style.fontKerning = 'none';
        const regular = _document.createElement('span');
        regular.classList.add('xterm-char-measure-element');
        const bold = _document.createElement('span');
        bold.classList.add('xterm-char-measure-element');
        bold.style.fontWeight = 'bold';
        const italic = _document.createElement('span');
        italic.classList.add('xterm-char-measure-element');
        italic.style.fontStyle = 'italic';
        const boldItalic = _document.createElement('span');
        boldItalic.classList.add('xterm-char-measure-element');
        boldItalic.style.fontWeight = 'bold';
        boldItalic.style.fontStyle = 'italic';
        this._measureElements = [regular, bold, italic, boldItalic];
        this._container.appendChild(regular);
        this._container.appendChild(bold);
        this._container.appendChild(italic);
        this._container.appendChild(boldItalic);
        _helperContainer.appendChild(this._container);
        this.clear();
    }
    dispose() {
        this._container.remove();
        this._measureElements.length = 0;
        this._holey = undefined;
    }
    clear() {
        this._flat.fill(-9999);
        this._holey = new Map();
    }
    setFont(font, fontSize, weight, weightBold) {
        if (font === this._font
            && fontSize === this._fontSize
            && weight === this._weight
            && weightBold === this._weightBold) {
            return;
        }
        this._font = font;
        this._fontSize = fontSize;
        this._weight = weight;
        this._weightBold = weightBold;
        this._container.style.fontFamily = this._font;
        this._container.style.fontSize = `${this._fontSize}px`;
        this._measureElements[0].style.fontWeight = `${weight}`;
        this._measureElements[1].style.fontWeight = `${weightBold}`;
        this._measureElements[2].style.fontWeight = `${weight}`;
        this._measureElements[3].style.fontWeight = `${weightBold}`;
        this.clear();
    }
    get(c, bold, italic) {
        let cp = 0;
        if (!bold && !italic && c.length === 1 && (cp = c.charCodeAt(0)) < 256) {
            if (this._flat[cp] !== -9999) {
                return this._flat[cp];
            }
            const width = this._measure(c, 0);
            if (width > 0) {
                this._flat[cp] = width;
            }
            return width;
        }
        let key = c;
        if (bold)
            key += 'B';
        if (italic)
            key += 'I';
        let width = this._holey.get(key);
        if (width === undefined) {
            let variant = 0;
            if (bold)
                variant |= 1;
            if (italic)
                variant |= 2;
            width = this._measure(c, variant);
            if (width > 0) {
                this._holey.set(key, width);
            }
        }
        return width;
    }
    _measure(c, variant) {
        const el = this._measureElements[variant];
        el.textContent = c.repeat(32);
        return el.offsetWidth / 32;
    }
}
exports.WidthCache = WidthCache;
//# sourceMappingURL=WidthCache.js.map