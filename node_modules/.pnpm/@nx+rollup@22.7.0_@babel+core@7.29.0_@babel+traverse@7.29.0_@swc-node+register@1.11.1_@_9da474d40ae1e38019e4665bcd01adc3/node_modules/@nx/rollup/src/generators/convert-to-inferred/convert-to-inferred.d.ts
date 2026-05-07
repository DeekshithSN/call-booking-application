import { type Tree } from '@nx/devkit';
interface Schema {
    project?: string;
    skipFormat?: boolean;
}
export declare function convertToInferred(tree: Tree, options: Schema): Promise<void>;
export default convertToInferred;
//# sourceMappingURL=convert-to-inferred.d.ts.map