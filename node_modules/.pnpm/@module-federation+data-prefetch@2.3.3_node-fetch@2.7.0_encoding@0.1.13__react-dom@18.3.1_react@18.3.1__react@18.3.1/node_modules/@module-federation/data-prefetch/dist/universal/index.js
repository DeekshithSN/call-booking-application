import { MFDataPrefetch } from "../prefetch.js";
import { getScope } from "../common/runtime-utils.js";

;// CONCATENATED MODULE: external "../prefetch.js"

;// CONCATENATED MODULE: external "../common/runtime-utils.js"

;// CONCATENATED MODULE: ./src/universal/index.ts


function prefetch(options) {
    const { id, functionId = 'default' } = options;
    const mfScope = getScope();
    const prefetchInstance = MFDataPrefetch.getInstance(mfScope) || new MFDataPrefetch({
        name: mfScope
    });
    const res = prefetchInstance.getProjectExports();
    if (res instanceof Promise) {
        const promise = res.then(()=>{
            const result = prefetchInstance.prefetch(options);
            prefetchInstance.memorize(id + functionId, result);
            return result;
        });
        return promise;
    } else {
        const result = prefetchInstance.prefetch(options);
        prefetchInstance.memorize(id + functionId, result);
        return result;
    }
}

export { prefetch };
