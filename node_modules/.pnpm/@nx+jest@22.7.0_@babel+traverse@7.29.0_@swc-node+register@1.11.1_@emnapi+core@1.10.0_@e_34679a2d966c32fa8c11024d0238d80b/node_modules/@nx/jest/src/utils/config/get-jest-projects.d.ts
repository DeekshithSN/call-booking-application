/**
 * Get a list of paths to all the jest config files
 * using the Nx Jest executor and `@nx/run:commands`
 * running `jest`.
 *
 * This is used to configure Jest multi-project support.
 *
 * To add a project not using the Nx Jest executor:
 * export default async () => ({
 *   projects: [...(await getJestProjectsAsync()), '<rootDir>/path/to/jest.config.ts'];
 * });
 *
 **/
export declare function getJestProjectsAsync(): Promise<string[]>;
//# sourceMappingURL=get-jest-projects.d.ts.map