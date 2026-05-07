/**
 * Support Tokens in Version Patterns
 * {projectName} - the name of the project
 * {currentDate} - the current date in YY.MM.DD format
 * {currentDate|DATE FORMAT} - the current date with custom format such as YYMM.DD
 * {commitSha} - The full commit sha for the current commit
 * {shortCommitSha} - The seven character commit sha for the current commit
 * {env.VAR_NAME} - The value of the environment variable VAR_NAME
 * {versionActionsVersion} - The version generated during the version actions such as "1.2.3"
 */
export interface PatternTokens {
    projectName: string;
    currentDate: Date;
    commitSha: string;
    shortCommitSha: string;
    versionActionsVersion: string;
}
export declare function interpolateVersionPattern(versionPattern: string, data: Partial<PatternTokens>): string;
//# sourceMappingURL=version-pattern-utils.d.ts.map