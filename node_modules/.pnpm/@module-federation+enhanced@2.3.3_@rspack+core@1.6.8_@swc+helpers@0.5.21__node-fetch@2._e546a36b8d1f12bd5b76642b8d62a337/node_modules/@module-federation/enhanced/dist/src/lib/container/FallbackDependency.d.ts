import * as webpack$1 from "webpack";
import { ObjectDeserializerContext, ObjectSerializerContext } from "webpack/lib/Dependency";

//#region src/lib/container/FallbackDependency.d.ts
declare const Dependency: typeof webpack$1.Dependency;
declare class FallbackDependency extends Dependency {
  requests: string[];
  /**
   * @param {string[]} requests requests
   */
  constructor(requests: string[]);
  /**
   * @returns {string | null} an identifier to merge equal requests
   */
  getResourceIdentifier(): string | null;
  get type(): string;
  get category(): string;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
  static deserialize(context: ObjectDeserializerContext): FallbackDependency;
}
//#endregion
export { FallbackDependency as default };
//# sourceMappingURL=FallbackDependency.d.ts.map