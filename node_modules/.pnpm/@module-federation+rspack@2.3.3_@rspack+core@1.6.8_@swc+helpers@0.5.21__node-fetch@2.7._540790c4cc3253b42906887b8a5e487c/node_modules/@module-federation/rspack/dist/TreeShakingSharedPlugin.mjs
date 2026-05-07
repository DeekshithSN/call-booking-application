
;// CONCATENATED MODULE: ./src/TreeShakingSharedPlugin.ts
const PLUGIN_NAME = 'RspackTreeShakingSharedPlugin';
class TreeShakingSharedPlugin {
    apply(compiler) {
        // @ts-expect-error wait rspack release
        new compiler.rspack.sharing.TreeShakingSharedPlugin(this._options).apply(compiler);
    }
    constructor(options){
        this.name = PLUGIN_NAME;
        this._options = options;
    }
}

export { PLUGIN_NAME, TreeShakingSharedPlugin };
