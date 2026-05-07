"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateBabelLoose;
const devkit_1 = require("@nx/devkit");
async function updateBabelLoose(tree) {
    (0, devkit_1.visitNotIgnoredFiles)(tree, '', (path) => {
        if (!path.endsWith('.babelrc'))
            return;
        try {
            (0, devkit_1.updateJson)(tree, path, (babelConfig) => {
                if (!Array.isArray(babelConfig.presets))
                    return babelConfig;
                const ourPreset = babelConfig.presets.find((p) => Array.isArray(p) && p[0] === '@nx/react/babel');
                if (!ourPreset || !ourPreset[1])
                    return babelConfig;
                const options = ourPreset[1];
                if (options['classProperties']?.loose !== undefined) {
                    options.loose = options['classProperties'].loose;
                    delete options['classProperties'];
                }
                return babelConfig;
            });
        }
        catch {
            // Skip if JSON does not parse for whatever reason
            return;
        }
    });
    await (0, devkit_1.formatFiles)(tree);
}
