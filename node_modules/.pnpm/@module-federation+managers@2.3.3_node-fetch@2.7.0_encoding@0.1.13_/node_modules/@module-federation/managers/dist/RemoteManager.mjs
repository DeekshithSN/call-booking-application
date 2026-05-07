import { composeKeyWithSeparator, parseEntry } from "@module-federation/sdk";
import { BasicPluginOptionsManager } from "./BasicPluginOptionsManager.mjs";
import { UNKNOWN_MODULE_NAME } from "./constant.mjs";

;// CONCATENATED MODULE: external "@module-federation/sdk"

;// CONCATENATED MODULE: external "./BasicPluginOptionsManager.mjs"

;// CONCATENATED MODULE: external "./constant.mjs"

;// CONCATENATED MODULE: ./src/RemoteManager.ts



function getEntry(remoteObj) {
    if (typeof remoteObj === 'string') {
        return remoteObj;
    }
    if (typeof remoteObj.external === 'string') {
        return remoteObj.external;
    }
    throw new Error('Not support "array" remote value yet!');
}
class RemoteManager extends BasicPluginOptionsManager {
    get enable() {
        return Boolean(this.remotes && (Array.isArray(this.remotes) ? this.remotes.length > 0 : Object.keys(this.remotes).length > 0));
    }
    get statsRemoteWithEmptyUsedIn() {
        const { name } = this.options;
        return Object.keys(this.normalizedOptions).reduce((sum, cur)=>{
            const normalizedOption = this.normalizedOptions[cur];
            let curObj;
            if ('entry' in normalizedOption) {
                curObj = {
                    entry: normalizedOption.entry,
                    alias: normalizedOption.alias,
                    moduleName: UNKNOWN_MODULE_NAME,
                    federationContainerName: normalizedOption.name,
                    consumingFederationContainerName: name,
                    usedIn: [
                        UNKNOWN_MODULE_NAME
                    ]
                };
            } else {
                curObj = {
                    alias: normalizedOption.alias,
                    moduleName: UNKNOWN_MODULE_NAME,
                    version: normalizedOption.version,
                    federationContainerName: normalizedOption.name,
                    consumingFederationContainerName: name,
                    usedIn: [
                        UNKNOWN_MODULE_NAME
                    ]
                };
            }
            sum.push(curObj);
            return sum;
        }, []);
    }
    // 'micro-app-sub3': 'app:@garfish/micro-app-sub3:0.0.4',
    // ↓↓↓
    //  {
    //   'micro-app-sub3': @garfish/micro-app-sub3:0.0.4
    // }
    get dtsRemotes() {
        return Object.keys(this.normalizedOptions).reduce((sum, remoteAlias)=>{
            const remoteInfo = this.normalizedOptions[remoteAlias];
            sum[remoteAlias] = composeKeyWithSeparator(remoteInfo.name, 'entry' in remoteInfo ? remoteInfo.entry : remoteInfo.version);
            return sum;
        }, {});
    }
    get remotes() {
        return this.options.remotes;
    }
    // INFO: only support remoteType: script now
    normalizeOptions(options = {}) {
        this.normalizedOptions = Object.keys(options).reduce((sum, remoteAlias)=>{
            if (Array.isArray(options)) {
                return sum;
            }
            const remoteInfo = options[remoteAlias];
            if (Array.isArray(remoteInfo)) {
                return sum;
            }
            let parsedOptions;
            try {
                parsedOptions = parseEntry(typeof remoteInfo === 'string' ? remoteInfo : getEntry(remoteInfo), '', '@');
            } catch (e) {
            // noop
            }
            if (!parsedOptions) {
                return sum;
            }
            sum[remoteAlias] = {
                ...parsedOptions,
                alias: remoteAlias,
                shareScope: typeof remoteInfo === 'object' ? remoteInfo.shareScope || 'default' : 'default'
            };
            return sum;
        }, {});
    }
    init(options) {
        this.setOptions(options);
        this.normalizeOptions(options.remotes);
    }
    constructor(...args){
        super(...args), this.normalizedOptions = {};
    }
}


export { RemoteManager };
