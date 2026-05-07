"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImport = addImport;
exports.findMainRenderStatement = findMainRenderStatement;
exports.findDefaultExport = findDefaultExport;
exports.findDefaultExportDeclaration = findDefaultExportDeclaration;
exports.findExportDeclarationsForJsx = findExportDeclarationsForJsx;
exports.findDefaultExportIdentifier = findDefaultExportIdentifier;
exports.findDefaultClassOrFunction = findDefaultClassOrFunction;
exports.findComponentImportPath = findComponentImportPath;
exports.findElements = findElements;
exports.findClosestOpening = findClosestOpening;
exports.isTag = isTag;
exports.addInitialRoutes = addInitialRoutes;
exports.addRoute = addRoute;
exports.addBrowserRouter = addBrowserRouter;
exports.addStaticRouter = addStaticRouter;
exports.addReduxStoreToMain = addReduxStoreToMain;
exports.updateReduxStore = updateReduxStore;
exports.getComponentNode = getComponentNode;
exports.parseComponentPropsInfo = parseComponentPropsInfo;
const js_1 = require("@nx/js");
const devkit_1 = require("@nx/devkit");
const ensure_typescript_1 = require("@nx/js/src/utils/typescript/ensure-typescript");
let tsModule;
function addImport(source, statement) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const allImports = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ImportDeclaration);
    if (allImports.length > 0) {
        const lastImport = allImports[allImports.length - 1];
        return [
            {
                type: devkit_1.ChangeType.Insert,
                index: lastImport.end + 1,
                text: `\n${statement}\n`,
            },
        ];
    }
    else {
        return [
            {
                type: devkit_1.ChangeType.Insert,
                index: 0,
                text: `\n${statement}\n`,
            },
        ];
    }
}
function findMainRenderStatement(source) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    // 1. Try to find ReactDOM.render.
    const calls = (0, js_1.findNodes)(source, tsModule.SyntaxKind.CallExpression);
    for (const expr of calls) {
        const inner = expr.expression;
        // React 17 and below
        if (tsModule.isPropertyAccessExpression(inner) &&
            /ReactDOM/i.test(inner.expression.getText()) &&
            inner.name.getText() === 'render') {
            return expr;
        }
        // React 18
        if (tsModule.isPropertyAccessExpression(inner) &&
            /root/.test(inner.expression.getText()) &&
            inner.name.getText() === 'render') {
            return expr;
        }
    }
    // 2. Try to find render from 'react-dom'.
    const imports = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ImportDeclaration);
    const hasRenderImport = imports.some((i) => i.moduleSpecifier.getText().includes('react-dom') &&
        /\brender\b/.test(i.importClause.namedBindings.getText()));
    if (hasRenderImport) {
        const calls = (0, js_1.findNodes)(source, tsModule.SyntaxKind.CallExpression);
        for (const expr of calls) {
            if (expr.expression.getText() === 'render') {
                return expr;
            }
        }
    }
    return null;
}
function findDefaultExport(source) {
    return (findDefaultExportDeclaration(source) || findDefaultClassOrFunction(source));
}
function findDefaultExportDeclaration(source) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const identifier = findDefaultExportIdentifier(source);
    if (identifier) {
        const variables = (0, js_1.findNodes)(source, tsModule.SyntaxKind.VariableDeclaration);
        const fns = (0, js_1.findNodes)(source, tsModule.SyntaxKind.FunctionDeclaration);
        const cls = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ClassDeclaration);
        const all = [...variables, ...fns, ...cls];
        const exported = all
            .filter((x) => x.name.kind === tsModule.SyntaxKind.Identifier)
            .find((x) => x.name.text === identifier.text);
        return exported || null;
    }
    else {
        return null;
    }
}
function findExportDeclarationsForJsx(source) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const variables = (0, js_1.findNodes)(source, tsModule.SyntaxKind.VariableDeclaration);
    const variableStatements = (0, js_1.findNodes)(source, tsModule.SyntaxKind.VariableStatement);
    const fns = (0, js_1.findNodes)(source, tsModule.SyntaxKind.FunctionDeclaration);
    const cls = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ClassDeclaration);
    const exportDeclarations = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ExportDeclaration);
    let componentNamesNodes = [];
    exportDeclarations.forEach((node) => {
        componentNamesNodes = [
            ...componentNamesNodes,
            ...(0, js_1.findNodes)(node, tsModule.SyntaxKind.ExportSpecifier),
        ];
    });
    const componentNames = componentNamesNodes?.map((node) => node.getText());
    const all = [...variables, ...variableStatements, ...fns, ...cls];
    let foundExport;
    let foundJSX;
    const nodesContainingJSX = all.filter((x) => {
        foundJSX = (0, js_1.findNodes)(x, [
            tsModule.SyntaxKind.JsxSelfClosingElement,
            tsModule.SyntaxKind.JsxOpeningElement,
        ]);
        return foundJSX?.length;
    });
    const exported = nodesContainingJSX.filter((x) => {
        foundExport = (0, js_1.findNodes)(x, tsModule.SyntaxKind.ExportKeyword);
        if (x.kind === tsModule.SyntaxKind.VariableStatement) {
            const nameNode = (0, js_1.findNodes)(x, tsModule.SyntaxKind.VariableDeclaration)?.[0];
            return (nameNode?.name?.kind === tsModule.SyntaxKind.Identifier ||
                foundExport?.length ||
                componentNames?.includes(nameNode?.name?.getText()));
        }
        else {
            return ((x.name.kind === tsModule.SyntaxKind.Identifier &&
                foundExport?.length) ||
                componentNames?.includes(x.name.getText()));
        }
    });
    const exportedDeclarations = exported.map((x) => {
        if (x.kind === tsModule.SyntaxKind.VariableStatement) {
            const nameNode = (0, js_1.findNodes)(x, tsModule.SyntaxKind.VariableDeclaration)?.[0];
            return nameNode;
        }
        return x;
    });
    return exportedDeclarations || null;
}
function findDefaultExportIdentifier(source) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const exports = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ExportAssignment);
    const identifier = exports
        .map((x) => x.expression)
        .find((x) => x.kind === tsModule.SyntaxKind.Identifier);
    return identifier || null;
}
function findDefaultClassOrFunction(source) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const fns = (0, js_1.findNodes)(source, tsModule.SyntaxKind.FunctionDeclaration);
    const cls = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ClassDeclaration);
    return (fns.find(hasDefaultExportModifier) ||
        cls.find(hasDefaultExportModifier) ||
        null);
}
function hasDefaultExportModifier(x) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    return (x.modifiers &&
        x.modifiers.some((m) => m.kind === tsModule.SyntaxKind.ExportKeyword) &&
        x.modifiers.some((m) => m.kind === tsModule.SyntaxKind.DefaultKeyword));
}
function findComponentImportPath(componentName, source) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const allImports = (0, js_1.findNodes)(source, tsModule.SyntaxKind.ImportDeclaration);
    const matching = allImports.filter((i) => {
        return (i.importClause &&
            i.importClause.name &&
            i.importClause.name.getText() === componentName);
    });
    if (matching.length === 0) {
        return null;
    }
    const appImport = matching[0];
    return appImport.moduleSpecifier.getText().replace(/['"]/g, '');
}
function findElements(source, tagName) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const nodes = (0, js_1.findNodes)(source, [
        tsModule.SyntaxKind.JsxSelfClosingElement,
        tsModule.SyntaxKind.JsxOpeningElement,
    ]);
    return nodes.filter((node) => isTag(tagName, node));
}
function findClosestOpening(tagName, node) {
    if (!node) {
        return null;
    }
    if (isTag(tagName, node)) {
        return node;
    }
    else {
        return findClosestOpening(tagName, node.parent);
    }
}
function isTag(tagName, node) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    if (tsModule.isJsxOpeningLikeElement(node)) {
        return (node.tagName.kind === tsModule.SyntaxKind.Identifier &&
            node.tagName.text === tagName);
    }
    if (tsModule.isJsxElement(node) && node.openingElement) {
        return (node.openingElement.tagName.kind === tsModule.SyntaxKind.Identifier &&
            node.openingElement.tagName.getText() === tagName);
    }
    return false;
}
function addInitialRoutes(sourcePath, source, addBrowserRouter) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const jsxClosingElements = (0, js_1.findNodes)(source, [
        tsModule.SyntaxKind.JsxClosingElement,
        tsModule.SyntaxKind.JsxClosingFragment,
    ]);
    const outerMostJsxClosing = jsxClosingElements[jsxClosingElements.length - 1];
    if (!outerMostJsxClosing) {
        devkit_1.logger.warn(`Could not find JSX elements in ${sourcePath}; Skipping insert routes`);
        return [];
    }
    const insertRoutes = {
        type: devkit_1.ChangeType.Insert,
        index: outerMostJsxClosing.getStart(),
        text: `
    {/* START: routes */}
    {/* These routes and navigation have been generated for you */}
    {/* Feel free to move and update them to fit your needs */}
    <br/>
    <hr/>
    <br/>
    <div role="navigation">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/page-2">Page 2</Link></li>
      </ul>
    </div>
    <Routes>
      <Route
        path="/"
        element={
          <div>This is the generated root route. <Link to="/page-2">Click here for page 2.</Link></div>
        }
      />
      <Route
        path="/page-2"
        element={
          <div><Link to="/">Click here to go back to root page.</Link></div>
        }
      />
    </Routes>
    {/* END: routes */}
    `,
    };
    return [
        ...addImport(source, `import { Route, Routes, Link ${addBrowserRouter ? ', BrowserRouter ' : ''}} from 'react-router-dom';`),
        insertRoutes,
    ];
}
function addRoute(sourcePath, source, options) {
    const routes = findElements(source, 'Route');
    const links = findElements(source, 'Link');
    if (routes.length === 0) {
        devkit_1.logger.warn(`Could not find <Route/> components in ${sourcePath}; Skipping add route`);
        return [];
    }
    else {
        const changes = [];
        const firstRoute = routes[0];
        const firstLink = links[0];
        changes.push(...addImport(source, `import { ${options.componentName} } from '${options.moduleName}';`));
        changes.push({
            type: devkit_1.ChangeType.Insert,
            index: firstRoute.getEnd(),
            text: `<Route path="${options.routePath}" element={<${options.componentName}/>} />`,
        });
        if (firstLink) {
            const parentLi = findClosestOpening('li', firstLink);
            if (parentLi) {
                changes.push({
                    type: devkit_1.ChangeType.Insert,
                    index: parentLi.getEnd(),
                    text: `<li><Link to="${options.routePath}">${options.componentName}</Link></li>`,
                });
            }
            else {
                changes.push({
                    type: devkit_1.ChangeType.Insert,
                    index: firstLink.parent.getEnd(),
                    text: `<Link to="${options.routePath}">${options.componentName}</Link>`,
                });
            }
        }
        return changes;
    }
}
function addBrowserRouter(sourcePath, source) {
    const app = findElements(source, 'App')[0];
    if (app) {
        return [
            ...addImport(source, `import { BrowserRouter } from 'react-router-dom';`),
            {
                type: devkit_1.ChangeType.Insert,
                index: app.getStart(),
                text: `<BrowserRouter>`,
            },
            {
                type: devkit_1.ChangeType.Insert,
                index: app.getEnd(),
                text: `</BrowserRouter>`,
            },
        ];
    }
    else {
        devkit_1.logger.warn(`Could not find App component in ${sourcePath}; Skipping add <BrowserRouter>`);
        return [];
    }
}
function addStaticRouter(sourcePath, source) {
    const app = findElements(source, 'App')[0];
    if (app) {
        return [
            ...addImport(source, `import { StaticRouter } from 'react-router-dom/server';`),
            {
                type: devkit_1.ChangeType.Insert,
                index: app.getStart(),
                text: `<StaticRouter location={req.originalUrl}>`,
            },
            {
                type: devkit_1.ChangeType.Insert,
                index: app.getEnd(),
                text: `</StaticRouter>`,
            },
        ];
    }
    else {
        devkit_1.logger.warn(`Could not find App component in ${sourcePath}; Skipping add <StaticRouter>`);
        return [];
    }
}
function addReduxStoreToMain(sourcePath, source) {
    const renderStmt = findMainRenderStatement(source);
    if (!renderStmt) {
        devkit_1.logger.warn(`Could not find render(...) in ${sourcePath}`);
        return [];
    }
    const jsx = renderStmt.arguments[0];
    return [
        ...addImport(source, `import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';`),
        {
            type: devkit_1.ChangeType.Insert,
            index: renderStmt.getStart(),
            text: `
const store = configureStore({
  reducer: {},
  // Additional middleware can be passed to this array
  middleware: getDefaultMiddleware => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production',
  // Optional Redux store enhancers
  enhancers: [],
});

`,
        },
        {
            type: devkit_1.ChangeType.Insert,
            index: jsx.getStart(),
            text: `<Provider store={store}>`,
        },
        {
            type: devkit_1.ChangeType.Insert,
            index: jsx.getEnd(),
            text: `</Provider>`,
        },
    ];
}
function updateReduxStore(sourcePath, source, feature) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const calls = (0, js_1.findNodes)(source, tsModule.SyntaxKind.CallExpression);
    let reducerDescriptor;
    // Look for configureStore call
    for (const expr of calls) {
        if (!expr.expression.getText().includes('configureStore')) {
            continue;
        }
        const arg = expr.arguments[0];
        if (tsModule.isObjectLiteralExpression(arg)) {
            let found;
            for (const prop of arg.properties) {
                if (tsModule.isPropertyAssignment(prop) &&
                    prop.name.getText() === 'reducer' &&
                    tsModule.isObjectLiteralExpression(prop.initializer)) {
                    found = prop.initializer;
                    break;
                }
            }
            if (found) {
                reducerDescriptor = found;
                break;
            }
        }
    }
    // Look for combineReducer call
    if (!reducerDescriptor) {
        for (const expr of calls) {
            if (!expr.expression.getText().includes('combineReducer')) {
                continue;
            }
            const arg = expr.arguments[0];
            if (tsModule.isObjectLiteralExpression(arg)) {
                reducerDescriptor = arg;
                break;
            }
        }
    }
    if (!reducerDescriptor) {
        devkit_1.logger.warn(`Could not find configureStore/combineReducer call in ${sourcePath}`);
        return [];
    }
    return [
        ...addImport(source, `import { ${feature.keyName}, ${feature.reducerName} } from '${feature.modulePath}';`),
        {
            type: devkit_1.ChangeType.Insert,
            index: reducerDescriptor.getStart() + 1,
            text: `[${feature.keyName}]: ${feature.reducerName}${reducerDescriptor.properties.length > 0 ? ',' : ''}`,
        },
    ];
}
function getComponentNode(sourceFile) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    const defaultExport = findDefaultExport(sourceFile);
    if (!(defaultExport &&
        ((0, js_1.findNodes)(defaultExport, tsModule.SyntaxKind.JsxElement).length > 0 ||
            (0, js_1.findNodes)(defaultExport, tsModule.SyntaxKind.JsxSelfClosingElement)
                .length > 0))) {
        return null;
    }
    return defaultExport;
}
function parseComponentPropsInfo(sourceFile, cmpDeclaration) {
    if (!tsModule) {
        tsModule = (0, ensure_typescript_1.ensureTypescript)();
    }
    let propsTypeName = null;
    let inlineTypeString = null;
    const props = [];
    const processParameters = (parameters) => {
        if (!parameters.length) {
            return null;
        }
        const propsParam = parameters[0];
        if (propsParam.type) {
            if (tsModule.isTypeReferenceNode(propsParam.type)) {
                // function Cmp(props: Props) {}
                propsTypeName = propsParam.type.typeName.getText();
            }
            else if (tsModule.isTypeLiteralNode(propsParam.type)) {
                // function Cmp(props: {a: string, b: number}) {}
                props.push(...propsParam.type.members);
                inlineTypeString = propsParam.type.getText();
            }
            else {
                // we don't support other types (e.g. union types)
                return false;
            }
        }
        else if (tsModule.isObjectBindingPattern(propsParam.name)) {
            // function Cmp({a, b}) {}
            props.push(...propsParam.name.elements);
            inlineTypeString = `{\n${propsParam.name.elements
                .map((x) => `${x.name.getText()}: unknown;\n`)
                .join('')}}`;
        }
        else {
            // function Cmp(props) {}
            return false;
        }
        return true;
    };
    if (tsModule.isFunctionDeclaration(cmpDeclaration)) {
        const result = processParameters(cmpDeclaration.parameters);
        if (!result) {
            return null;
        }
    }
    else if (tsModule.isVariableDeclaration(cmpDeclaration) &&
        cmpDeclaration.initializer &&
        tsModule.isArrowFunction(cmpDeclaration.initializer)) {
        const result = processParameters(cmpDeclaration.initializer.parameters);
        if (!result) {
            return null;
        }
    }
    else if (
    // do we have a class component extending from React.Component
    tsModule.isClassDeclaration(cmpDeclaration) &&
        cmpDeclaration.heritageClauses &&
        cmpDeclaration.heritageClauses.length > 0) {
        const heritageClause = cmpDeclaration.heritageClauses[0];
        if (heritageClause) {
            const propsTypeExpression = heritageClause.types.find((x) => {
                const name = x.expression.escapedText ||
                    x.expression.name.text;
                return name === 'Component' || name === 'PureComponent';
            });
            if (propsTypeExpression?.typeArguments?.[0]?.['typeName']) {
                propsTypeName = propsTypeExpression.typeArguments[0].typeName.getText();
            }
        }
    }
    else {
        return null;
    }
    if (propsTypeName) {
        const foundProps = getPropsFromTypeName(sourceFile, propsTypeName);
        if (!foundProps) {
            return null;
        }
        for (const prop of foundProps) {
            props.push(prop);
        }
    }
    return {
        propsTypeName,
        props,
        inlineTypeString,
    };
}
function getPropsFromTypeName(sourceFile, propsTypeName) {
    const matchingNode = (0, js_1.findNodes)(sourceFile, [
        tsModule.SyntaxKind.InterfaceDeclaration,
        tsModule.SyntaxKind.TypeAliasDeclaration,
    ]).find((x) => {
        if (tsModule.isTypeAliasDeclaration(x) ||
            tsModule.isInterfaceDeclaration(x)) {
            return x.name.getText() === propsTypeName;
        }
        return false;
    });
    if (!matchingNode) {
        return null;
    }
    const props = [];
    if (tsModule.isTypeAliasDeclaration(matchingNode)) {
        if (tsModule.isTypeLiteralNode(matchingNode.type)) {
            for (const prop of matchingNode.type.members) {
                props.push(prop);
            }
        }
        else if (tsModule.isTypeReferenceNode(matchingNode.type)) {
            const result = getPropsFromTypeName(sourceFile, matchingNode.type.typeName.getText());
            if (result) {
                props.push(...result);
            }
        }
        else {
            // we don't support other types of type aliases (e.g. union types)
            return null;
        }
    }
    else {
        for (const prop of matchingNode.members) {
            props.push(prop);
        }
    }
    return props;
}
