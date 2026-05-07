import path from "path";
import find_pkg from "find-pkg";
import fs from "fs";
import { MFModuleType, logger } from "@module-federation/sdk";

;// CONCATENATED MODULE: external "path"

;// CONCATENATED MODULE: external "find-pkg"

;// CONCATENATED MODULE: external "fs"

;// CONCATENATED MODULE: external "@module-federation/sdk"

;// CONCATENATED MODULE: ./src/PKGJsonManager.ts

// @ts-ignore this pkg miss types



class PKGJsonManager {
    setPKGJson(pkg) {
        this._pkg = pkg;
    }
    readPKGJson(root = process.cwd()) {
        if (this._pkg) {
            return this._pkg;
        }
        try {
            // eslint-disable-next-line no-restricted-globals
            const pkg = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json'), 'utf8'));
            this._pkg = pkg;
            return pkg;
        } catch (_err) {
            try {
                const pkg = find_pkg.sync(root);
                this._pkg = pkg;
                return pkg;
            } catch (err) {
                logger.error(err);
                return {};
            }
        }
    }
    getExposeGarfishModuleType(root = process.cwd()) {
        var _pkg_mf;
        const pkg = this.readPKGJson(root);
        return (pkg === null || pkg === void 0 ? void 0 : (_pkg_mf = pkg['mf']) === null || _pkg_mf === void 0 ? void 0 : _pkg_mf.type) === MFModuleType.NPM ? MFModuleType.NPM : MFModuleType.APP;
    }
}

export { PKGJsonManager };
