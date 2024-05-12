"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDisposableDomListener = void 0;
function addDisposableDomListener(node, type, handler, options) {
    node.addEventListener(type, handler, options);
    let disposed = false;
    return {
        dispose: () => {
            if (disposed) {
                return;
            }
            disposed = true;
            node.removeEventListener(type, handler, options);
        }
    };
}
exports.addDisposableDomListener = addDisposableDomListener;
//# sourceMappingURL=Lifecycle.js.map