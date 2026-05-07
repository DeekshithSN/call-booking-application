import type * as ts from 'typescript';
export declare function getArgsDefaultValue(property: ts.SyntaxKind): string;
export declare function getComponentPropDefaults(sourceFile: ts.SourceFile, cmpDeclaration: ts.Node): {
    propsTypeName: string | null;
    inlineTypeString: string | null;
    props: {
        name: string;
        defaultValue: any;
    }[];
    argTypes: {
        name: string;
        type: string;
        actionText: string;
    }[];
};
export declare function getImportForType(sourceFile: ts.SourceFile, typeName: string): ts.Statement;
//# sourceMappingURL=component-props.d.ts.map