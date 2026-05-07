
;// CONCATENATED MODULE: ./src/BasicPluginOptionsManager.ts
class BasicPluginOptionsManager {
    get enable() {
        return Boolean(this._options);
    }
    get options() {
        return this._options;
    }
    get root() {
        return this._root;
    }
    init(options, extraArgs) {
        this._options = options;
    }
    setOptions(options) {
        this._options = options;
    }
    constructor(root = process.cwd()){
        this._root = root;
    }
}

export { BasicPluginOptionsManager };
