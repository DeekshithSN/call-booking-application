import { Linter } from 'eslint';
export declare const extraEslintDependencies: {
    dependencies: {};
    devDependencies: {
        'eslint-plugin-import': string;
        'eslint-plugin-jsx-a11y': string;
        'eslint-plugin-react': string;
        'eslint-plugin-react-hooks': string;
    };
};
/**
 * @deprecated Use `addExtendsToLintConfig` from `@nx/eslint` instead.
 */
export declare const extendReactEslintJson: (json: Linter.LegacyConfig) => Linter.LegacyConfig;
//# sourceMappingURL=lint.d.ts.map