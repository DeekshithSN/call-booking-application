"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createAiInstructionsForVitest;
const path_1 = require("path");
const fs_1 = require("fs");
async function createAiInstructionsForVitest(tree) {
    const pathToAiInstructions = (0, path_1.join)(__dirname, 'files', 'ai-instructions-for-vitest-4.md');
    if (!(0, fs_1.existsSync)(pathToAiInstructions)) {
        return;
    }
    const contents = (0, fs_1.readFileSync)(pathToAiInstructions);
    tree.write('tools/ai-migrations/MIGRATE_VITEST_4.md', contents);
    return [
        `We created 'tools/ai-migrations/MIGRATE_VITEST_4.md' with instructions for an AI Agent to help migrate your Vitest projects to Vitest 4.`,
    ];
}
