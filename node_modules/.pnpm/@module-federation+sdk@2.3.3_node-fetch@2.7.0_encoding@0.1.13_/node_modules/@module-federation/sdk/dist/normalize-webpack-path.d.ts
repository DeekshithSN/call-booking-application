import webpack from "webpack";

//#region src/normalize-webpack-path.d.ts
declare function getWebpackPath(compiler: webpack.Compiler, options?: {
  framework: 'nextjs' | 'other';
}): string;
declare const normalizeWebpackPath: (fullPath: string) => string;
//#endregion
export { getWebpackPath, normalizeWebpackPath };
//# sourceMappingURL=normalize-webpack-path.d.ts.map