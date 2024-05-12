"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkRenderLayer = void 0;
const CharAtlasUtils_1 = require("browser/renderer/shared/CharAtlasUtils");
const Constants_1 = require("browser/renderer/shared/Constants");
const BaseRenderLayer_1 = require("./BaseRenderLayer");
class LinkRenderLayer extends BaseRenderLayer_1.BaseRenderLayer {
    constructor(container, zIndex, terminal, linkifier2, coreBrowserService, optionsService, themeService) {
        super(terminal, container, 'link', zIndex, true, coreBrowserService, optionsService, themeService);
        this.register(linkifier2.onShowLinkUnderline(e => this._handleShowLinkUnderline(e)));
        this.register(linkifier2.onHideLinkUnderline(e => this._handleHideLinkUnderline(e)));
    }
    resize(terminal, dim) {
        super.resize(terminal, dim);
        this._state = undefined;
    }
    reset(terminal) {
        this._clearCurrentLink();
    }
    _clearCurrentLink() {
        if (this._state) {
            this._clearCells(this._state.x1, this._state.y1, this._state.cols - this._state.x1, 1);
            const middleRowCount = this._state.y2 - this._state.y1 - 1;
            if (middleRowCount > 0) {
                this._clearCells(0, this._state.y1 + 1, this._state.cols, middleRowCount);
            }
            this._clearCells(0, this._state.y2, this._state.x2, 1);
            this._state = undefined;
        }
    }
    _handleShowLinkUnderline(e) {
        if (e.fg === Constants_1.INVERTED_DEFAULT_COLOR) {
            this._ctx.fillStyle = this._themeService.colors.background.css;
        }
        else if (e.fg !== undefined && (0, CharAtlasUtils_1.is256Color)(e.fg)) {
            this._ctx.fillStyle = this._themeService.colors.ansi[e.fg].css;
        }
        else {
            this._ctx.fillStyle = this._themeService.colors.foreground.css;
        }
        if (e.y1 === e.y2) {
            this._fillBottomLineAtCells(e.x1, e.y1, e.x2 - e.x1);
        }
        else {
            this._fillBottomLineAtCells(e.x1, e.y1, e.cols - e.x1);
            for (let y = e.y1 + 1; y < e.y2; y++) {
                this._fillBottomLineAtCells(0, y, e.cols);
            }
            this._fillBottomLineAtCells(0, e.y2, e.x2);
        }
        this._state = e;
    }
    _handleHideLinkUnderline(e) {
        this._clearCurrentLink();
    }
}
exports.LinkRenderLayer = LinkRenderLayer;
//# sourceMappingURL=LinkRenderLayer.js.map