import { murmurhash3_32_gc } from '../../thirdparty-libs/murmurhash3_gc.js';
import { LZString } from '../../thirdparty-libs/lz-string.js';


// TODO: Implement it at API level with cache: {'from': 'idb'/'ls'} // Async routine cache update on each App Load
// Cache Table to keep track of keys and UTS, CTS
class BaseCache {
    constructor(State){
        this.State = State;
    }

    getByteSize = (strObj) => {
        return new Blob([strObj]).size;
    }

    cacheIsExpired = (key, resource) => {
        return (Date.now() - this.getCachedTime(key)) > resource.cache.validityTime;
    }

    makeHashKey = (resource, params = null) => {
        var string_key = null;
        if (params !== null & params !== undefined) {
            string_key = JSON.stringify(resource.route) + JSON.stringify(params);
        } else {
            string_key = JSON.stringify(resource.route);
        }
        return this.hash(string_key);
    }

    hash = (stringKey) => {
        var key = stringKey.replace(/[\u007F-\uFFFF]/g, function(chr) {
            return "\\u" + ("0000" + chr.charCodeAt(0).toString(16)).substr(-4)
        });
        return JSON.stringify(murmurhash3_32_gc(key));
    }
}

class LocalStorage extends BaseCache {
    constructor(State){
        super(State);
        this.State = State;
    }

    getCachedTime = (key) => {
        var result = parseInt(JSON.parse(window.localStorage.getItem('__ts_' + key)));
        if (isNaN(result) || result === null || result === undefined && result) {
            return 0;
        } else {
            return result;
        }

    }

    get = (key) => {
        return new Promise((resolve, reject) => {
            let cachedValue = window.localStorage.getItem(key);
            if (cachedValue !== undefined && cachedValue !== null) {
                let decompressedCachedValue = LZString.decompress(cachedValue);
                let parsedCachedValue = JSON.parse(decompressedCachedValue);

                console.log({
                    'Loading from Cache:': true, 
                    'cached_key': key, 
                    'compressed_size_kb': this.getByteSize(cachedValue) /1000, 
                    'decompressed_size_kb': this.getByteSize(decompressedCachedValue) /1000,
                    // 'value': parsedCachedValue
                });
                return resolve(parsedCachedValue);
            } else {
                return reject('Cache object not found with key:' + key)
            }
        });
    }

    getFromCache = (resource, params = null) => {
        return new Promise((resolve, reject) => {
            if (resource.cache.validityTime === 0) {
                return reject('ZERO-CACHE-POLICY');
            }
            let key = this.makeHashKey(resource, params);
            console.log('Hash Key: ', key);
            console.log('NOT-YET-CACHE', !this.cacheIsAvailable(key));
            console.log('EXPIRED_CACHE', this.cacheIsExpired(key, resource));
            if (!this.cacheIsAvailable(key)) {
                return reject(['NOT-YET-CACHE', key, resource.route].join('___'));
            }
            if (this.cacheIsExpired(key, resource)) {
                this.removeFromCache(key);
                return reject(['EXPIRED_CACHE', key, resource.route].join('___'));
            }
            console.log({'Cached Resource: ': resource.route, 'params': params});
            return this.get(key);
        })
    }

    removeFromCache = (key) => {
        console.log('removeFromCache', key);
        window.localStorage.removeItem('_ts_' + key);
        window.localStorage.removeItem(key);
    }

    setInCacheForGet = (resource, params, responseData) => {
        if (resource.cache.validityTime > 0) {
            let key = this.makeHashKey(resource, params);
            this.setInCache(key, responseData, resource);
        }
    }

    setInCacheForPost = (resource, data, responseData) => {
        if (resource.cache.validityTime > 0) {
            let key = this.makeHashKey(resource, data, resource);
            this.setInCache(key, responseData);
        }
    }

    setInCache = (key, responseData, resource) => {
        if (this.cacheIsExpired(key, resource) || !this.cacheIsAvailable(key)) {
            console.log('Caching Data of: ', resource.route);
            window.localStorage.setItem('__ts_' + key, JSON.stringify(Date.now()));
            window.localStorage.setItem(key, LZString.compress(JSON.stringify(responseData)));
        }
    }

    cacheIsAvailable = (key) => {
        let value = this.getCachedTime(key);
        if (value > 0) {
            return true;
        } else {
            return false;
        }
    }
}

class IndexedDB extends BaseCache {
    constructor(State){
        super(State);
        this.State = State;
    }

    getLocalCacheTable = () => {
        return this.State.Root.Services.Data.DB.Tables.Cache.then(cacheTable => {
            return Promise.resolve(cacheTable.getAllKeys('Cache'));
        })
    }

    getServerCacheTable = (keys=[]) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.service_cache, keys, {}).then( cacheObjects => {
            return Promise.resolve(cacheObjects);
        })
    }

    updateCacheTable = () => {
        return this.getCacheTable().then(cacheKeys => {

        })
    }
}

class Syncronize {
    constructor(State){
        this.State = State;
    }

    getCacheTable = () => { // In Case Backend Data Changes Out of sync with CachingValidity Time set on frontend
        // Store in IndexedDB or LocalStorage

    }

    isCacheStillValid = () => { // Wrap Resource.CacheValidityTime && ValidityCheck from Backend CacheTable return Boolean

    }
}

export class Cache extends BaseCache {
    // Make a single wrapper for localstorage and IndexedDB with Fallback Policy to the one available on client side
    constructor(State){
        super(State);
        this.State = State;
        this.IndexedDB = new IndexedDB(State);
        this.LocalStorage = new LocalStorage(State);
    }
}