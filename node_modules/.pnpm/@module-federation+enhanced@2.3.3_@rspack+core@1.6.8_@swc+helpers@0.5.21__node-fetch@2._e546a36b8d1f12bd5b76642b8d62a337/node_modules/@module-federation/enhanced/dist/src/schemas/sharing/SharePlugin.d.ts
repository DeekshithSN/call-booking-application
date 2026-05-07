//#region src/schemas/sharing/SharePlugin.d.ts
declare const _default: {
  readonly definitions: {
    readonly Shared: {
      readonly description: "Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.";
      readonly anyOf: readonly [{
        readonly type: "array";
        readonly items: {
          readonly description: "Modules that should be shared in the share scope.";
          readonly anyOf: readonly [{
            readonly $ref: "#/definitions/SharedItem";
          }, {
            readonly $ref: "#/definitions/SharedObject";
          }];
        };
      }, {
        readonly $ref: "#/definitions/SharedObject";
      }];
    };
    readonly SharedConfig: {
      readonly description: "Advanced configuration for modules that should be shared in the share scope.";
      readonly type: "object";
      readonly additionalProperties: false;
      readonly properties: {
        readonly eager: {
          readonly description: "Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.";
          readonly type: "boolean";
        };
        readonly exclude: {
          readonly description: "Options for excluding specific versions or request paths of the shared module. When specified, matching modules will not be shared. Cannot be used with 'include'.";
          readonly $ref: "#/definitions/IncludeExcludeOptions";
        };
        readonly include: {
          readonly description: "Options for including only specific versions or request paths of the shared module. When specified, only matching modules will be shared. Cannot be used with 'exclude'.";
          readonly $ref: "#/definitions/IncludeExcludeOptions";
        };
        readonly import: {
          readonly description: "Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.";
          readonly anyOf: readonly [{
            readonly description: "No provided or fallback module.";
            readonly enum: readonly [false];
          }, {
            readonly $ref: "#/definitions/SharedItem";
          }];
        };
        readonly packageName: {
          readonly description: "Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.";
          readonly type: "string";
          readonly minLength: 1;
        };
        readonly requiredVersion: {
          readonly description: "Version requirement from module in share scope.";
          readonly anyOf: readonly [{
            readonly description: "No version requirement check.";
            readonly enum: readonly [false];
          }, {
            readonly description: "Version as string. Can be prefixed with '^' or '~' for minimum matches. Each part of the version should be separated by a dot '.'.";
            readonly type: "string";
          }];
        };
        readonly shareKey: {
          readonly description: "Module is looked up under this key from the share scope.";
          readonly type: "string";
          readonly minLength: 1;
        };
        readonly shareScope: {
          readonly description: "Share scope name.";
          readonly anyOf: readonly [{
            readonly type: "string";
            readonly minLength: 1;
          }, {
            readonly type: "array";
            readonly items: {
              readonly type: "string";
              readonly minLength: 1;
            };
          }];
        };
        readonly singleton: {
          readonly description: "Allow only a single version of the shared module in share scope (disabled by default).";
          readonly type: "boolean";
        };
        readonly strictVersion: {
          readonly description: "Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).";
          readonly type: "boolean";
        };
        readonly treeShaking: {
          readonly description: "Enable tree-shaking for the shared module or configure it.";
          readonly anyOf: readonly [{
            readonly type: "boolean";
          }, {
            readonly $ref: "#/definitions/TreeShakingConfig";
          }];
        };
        readonly independentShareFileName: {
          readonly description: "Custom file name for independent share build/output.";
          readonly type: "string";
          readonly minLength: 1;
        };
        readonly version: {
          readonly description: "Version of the provided module. Will replace lower matching versions, but not higher.";
          readonly anyOf: readonly [{
            readonly description: "Don't provide a version.";
            readonly enum: readonly [false];
          }, {
            readonly description: "Version as string. Each part of the version should be separated by a dot '.'.";
            readonly type: "string";
          }];
        };
        readonly request: {
          readonly description: "Import request to match on";
          readonly type: "string";
          readonly minLength: 1;
        };
        readonly layer: {
          readonly description: "Layer in which the shared module should be placed.";
          readonly type: "string";
          readonly minLength: 1;
        };
        readonly issuerLayer: {
          readonly description: "Layer of the issuer.";
          readonly type: "string";
          readonly minLength: 1;
        };
        readonly allowNodeModulesSuffixMatch: {
          readonly description: "Enable reconstructed lookup for node_modules paths for this share item";
          readonly type: "boolean";
        };
      };
    };
    readonly SharedItem: {
      readonly description: "A module that should be shared in the share scope.";
      readonly type: "string";
      readonly minLength: 1;
    };
    readonly SharedObject: {
      readonly description: "Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.";
      readonly type: "object";
      readonly additionalProperties: {
        readonly description: "Modules that should be shared in the share scope.";
        readonly anyOf: readonly [{
          readonly $ref: "#/definitions/SharedConfig";
        }, {
          readonly $ref: "#/definitions/SharedItem";
        }];
      };
    };
    readonly Exclude: {
      readonly description: "Advanced filtering options.";
      readonly type: "object";
      readonly additionalProperties: false;
      readonly properties: {
        readonly request: {
          readonly description: "Regular expression pattern to filter module requests";
          readonly instanceof: "RegExp";
        };
        readonly version: {
          readonly description: "Specific version string or range to filter by (exclude matches).";
          readonly type: "string";
        };
        readonly fallbackVersion: {
          readonly description: "Optional specific version string to check against the exclude.version range instead of reading package.json.";
          readonly type: "string";
        };
      };
    };
    readonly IncludeExcludeOptions: {
      readonly type: "object";
      readonly properties: {
        readonly request: {
          readonly type: readonly ["string", "object"];
          readonly description: "A string (which can be a regex pattern) or a RegExp object to match the request path.";
        };
        readonly version: {
          readonly type: "string";
          readonly description: "Semantic versioning range to match against the module's version.";
        };
        readonly fallbackVersion: {
          readonly type: "string";
          readonly description: "Semantic versioning range to match against the fallback module's version for exclusion/inclusion context where applicable.";
        };
      };
      readonly additionalProperties: false;
      readonly anyOf: readonly [{
        readonly required: readonly ["request"];
      }, {
        readonly required: readonly ["version"];
      }, {
        readonly required: readonly ["fallbackVersion"];
      }];
    };
    readonly TreeShakingConfig: {
      readonly description: "Tree-shake configuration for shared module.";
      readonly type: "object";
      readonly additionalProperties: false;
      readonly properties: {
        readonly usedExports: {
          readonly description: "List of export names used from the shared module.";
          readonly type: "array";
          readonly items: {
            readonly type: "string";
            readonly minLength: 1;
          };
        };
        readonly mode: {
          readonly description: "Tree-shake analysis mode.";
          readonly type: "string";
          readonly enum: readonly ["server-calc", "runtime-infer"];
        };
        readonly filename: {
          readonly description: "Filename for generated treeShaking metadata.";
          readonly type: "string";
        };
      };
    };
  };
  readonly title: "SharePluginOptions";
  readonly description: "Options for shared modules.";
  readonly type: "object";
  readonly additionalProperties: false;
  readonly properties: {
    readonly async: {
      readonly description: "Enable/disable asynchronous loading of runtime modules. When enabled, entry points will be wrapped in asynchronous chunks.";
      readonly type: "boolean";
    };
    readonly shareScope: {
      readonly description: "Share scope name used for all shared modules (defaults to 'default').";
      readonly anyOf: readonly [{
        readonly type: "string";
        readonly minLength: 1;
      }, {
        readonly type: "array";
        readonly items: {
          readonly type: "string";
          readonly minLength: 1;
        };
      }];
    };
    readonly shared: {
      readonly $ref: "#/definitions/Shared";
    };
    readonly experiments: {
      readonly description: "Experimental features configuration";
      readonly type: "object";
      readonly additionalProperties: false;
      readonly properties: {
        readonly allowNodeModulesSuffixMatch: {
          readonly description: "Enable reconstructed lookup for node_modules paths";
          readonly type: "boolean";
        };
      };
    };
  };
  readonly required: readonly ["shared"];
};
//#endregion
export { _default as default };
//# sourceMappingURL=SharePlugin.d.ts.map