"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    testDir: '.',
    timeout: 10000,
    projects: [
        {
            name: 'Chrome Stable',
            use: {
                browserName: 'chromium',
                channel: 'chrome'
            }
        },
        {
            name: 'Firefox Stable',
            use: {
                browserName: 'firefox'
            }
        },
        {
            name: 'WebKit',
            use: {
                browserName: 'webkit'
            }
        }
    ],
    reporter: 'list',
    webServer: {
        command: 'npm start',
        port: 3000,
        timeout: 120000,
        reuseExistingServer: !process.env.CI
    }
};
exports.default = config;
//# sourceMappingURL=playwright.config.js.map