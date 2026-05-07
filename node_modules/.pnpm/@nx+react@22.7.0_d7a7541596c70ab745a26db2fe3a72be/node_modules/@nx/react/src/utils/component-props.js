"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgsDefaultValue = getArgsDefaultValue;
exports.getComponentPropDefaults = getComponentPropDefaults;
exports.getImportForType = getImportForType;
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
const ast_utils_1 = require("./ast-utils");
let tsModule;
// TODO: candidate to refactor with the angular component story
function getArgsDefaultValue(property) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const typeNameToDefault = {
        [tsModule.SyntaxKind.StringKeyword]: "''",
        [tsModule.SyntaxKind.NumberKeyword]: 0,
        [tsModule.SyntaxKind.BooleanKeyword]: false,
    };
    const resolvedValue = typeNameToDefault[property];
    if (resolvedValue === undefined) {
        return "''";
    }
    else {
        return resolvedValue;
    }
}
function getComponentPropDefaults(sourceFile, cmpDeclaration) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const info = (0, ast_utils_1.parseComponentPropsInfo)(sourceFile, cmpDeclaration);
    let propsTypeName = null;
    let inlineTypeString = null;
    let props = [];
    let argTypes = [];
    if (info) {
        propsTypeName = info.propsTypeName;
        inlineTypeString = info.inlineTypeString;
        props = info.props.map((member) => {
            if (tsModule.isPropertySignature(member)) {
                if (member.type.kind === tsModule.SyntaxKind.FunctionType) {
                    argTypes.push({
                        name: member.name.getText(),
                        type: 'action',
                        actionText: `${member.name.getText()} executed!`,
                    });
                }
                else {
                    return {
                        name: member.name.getText(),
                        defaultValue: getArgsDefaultValue(member.type.kind),
                    };
                }
            }
            else {
                // it's a binding element, which doesn't have a type, e.g.:
                // const Cmp = ({ a, b }) => {}
                return {
                    name: member.name.getText(),
                    defaultValue: getArgsDefaultValue(member.kind),
                };
            }
        });
        props = props.filter((p) => p && p.defaultValue !== undefined);
    }
    return { propsTypeName, inlineTypeString, props, argTypes };
}
function getImportForType(sourceFile, typeName) {
    return sourceFile.statements.find((statement) => tsModule.isImportDeclaration(statement) &&
        statement.getText().includes(typeName));
}
