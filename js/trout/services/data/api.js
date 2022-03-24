import { Cache } from './cache.js';

// TODO: Implement it at API level with cache: {'from': 'idb'/'ls'} // Async routine cache update on each App Load
// Cache Table to keep track of keys and UTS, CTS

export class API extends Cache{
    constructor(State, Cookies) {
        super(State);
        this.State = State;
        this.cookies = Cookies;
    }

    Headers = (xhr) => {
        xhr.setRequestHeader("Authorization", this.cookies.getUserUUID());
    }

    beacon = (resource, data) => {
        navigator.sendBeacon(resource.route, JSON.stringify(data));
    }

    indexedDBTryCachedPost = (resource, data, postAjax) => {
        let that = this;
        return that.IndexedDB.getFromCache(resource, data).then(result => { 
            if (result === null){
                var hashKey = that.makeHashKey(resource, data);
                console.log('Bad Cache', resource, data, hashKey);
                that.removeFromCache(hashKey);
                return postAjax(resource, data, { cacheStorage: that.indexedDB });
            }
            return Promise.resolve(result);
        }, reject => { 
            console.log('No Cache call postAjax', reject, resource);
            return postAjax(resource, data, { cacheStorage: that.indexedDB });
        })
    }

    indexedDBTryCachedGet = (resource, { urlParams = null, type = 'json'}, getAjax) => {
        let that = this;
        return that.IndexedDB.getFromCache(resource, urlParams).then(result => { 
            if (result === null){
                var hashKey = that.makeHashKey(resource, urlParams);
                console.log('Bad Cache', resource, urlParams, hashKey);
                that.removeFromCache(hashKey);
                return getAjax(resource, { urlParams: urlParams, type: type, cacheStorage: that.indexedDB });
            }
            return Promise.resolve(result);
        }, reject => { 
            // console.log('No Cache call getAjax', reject, resource);
            return getAjax(resource, { urlParams: urlParams, type: type, cacheStorage: that.indexedDB });
        })
    }

    localStorageTryCachedPost = (resource, data, postAjax) => {
        let that = this;
        return that.LocalStorage.getFromCache(resource, data).then(result => { 
            if (result === null){
                var hashKey = that.makeHashKey(resource, data);
                console.log('Bad Cache', resource, data, hashKey);
                that.LocalStorage.removeFromCache(hashKey);
                return postAjax(resource, data, { cacheStorage: that.LocalStorage });
            }
            if (that.State.Settings.debug){
                console.log(result);
            }
            return Promise.resolve(result);
        }, reject => { 
            console.log('No Cache call postAjax', reject, resource);
            return postAjax(resource, data, { cacheStorage: that.LocalStorage });
        })
    }

    localStorageTryCachedGet = (resource, { urlParams = null, type = 'json' }, getAjax) => {
        let that = this;
        return that.LocalStorage.getFromCache(resource, urlParams).then(result => { 
            if (result === null){
                var hashKey = that.makeHashKey(resource, urlParams);
                console.log('Bad Cache', resource, urlParams, hashKey);
                that.LocalStorage.removeFromCache(hashKey);
                return getAjax(resource, { urlParams: urlParams, type: type, cacheStorage: that.LocalStorage });
            }
            if (that.State.Settings.debug){
                console.log('Parsed Cache Result:', result);
            }
            console.log('Parsed Cache Result:', result);
            return Promise.resolve(result);
        }, reject => { 
            // console.log('No Cache call getAjax', reject, resource);
            return getAjax(resource, { urlParams: urlParams, type: type, cacheStorage: that.LocalStorage });
        })
    }

    DirectPost = (resource, data, { cacheStorage = null }) => {
        let that = this;
        var error = new Error();
        return new Promise((resolve, reject) => {
            if (resource.auth && that.cookies.getUserUUID() === null) {
                reject('Auth Fails: UUID is not available in cookies.');
            } else {
                $.ajax({
                    url: resource.route,
                    type: "POST",
                    dataType: "json",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    crossDomain: true,
                    async: true,
                    beforeSend: that.Headers,
                    success: function (responseData) {
                        if (cacheStorage !== null){
                            cacheStorage.setInCacheForPost(resource, data, responseData);
                        }
                        resolve(responseData);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        if (that.State.Settings.debug) {
                            console.log(error.stack);
                            console.log(resource, XMLHttpRequest.responseText, textStatus, errorThrown);
                        }
                        reject([data, XMLHttpRequest.responseText, error.stack]);
                    }
                });
            }
        });
    }

    DirectGet = (resource, { urlParams = null, type = 'json', cacheStorage = null }) => {
        let that = this;
        var error = new Error();
        var urlTail = resource.route.split('.').pop();
        var routeUrlWithParams = resource.route;
        if (urlParams) {
            routeUrlWithParams = that.State.Root.Services.Session.routeWithParams(resource, urlParams)
        }

        console.log('DirectGet: ', routeUrlWithParams)


        console.log('loading fuck 1.. ', resource.route)

        return new Promise((resolve, reject) => {
            if (resource.auth && that.cookies.getUserUUID() === null) {
                return reject('Auth Fails: UUID is not available in cookies.');
            } else {
                let ajaxSettings = {
                    type: "GET",
                    url: routeUrlWithParams,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    crossDomain: true,
                    async: true,
                    beforeSend: that.Headers,
                    success: function (responseData) {
                        if (cacheStorage !== null){
                            cacheStorage.setInCacheForGet(resource, urlParams, responseData);
                        }
                        return resolve(responseData);
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        if (that.State.Settings.debug) {
                            console.log('DEBUG:      DirectGet Error: ', 
                            error, error.stack, 
                            XMLHttpRequest.debug, textStatus, errorThrown);
                            alert('Fucks!!!');
                        }

                        console.log('loading fuck 2.. ', resource.route)
                        return reject(error);
                    }
                }
                if (urlTail !== 'js' && (type !== 'json'  || ['html', 'css'].includes(urlTail))) {
                    delete ajaxSettings['dataType'];
                    delete ajaxSettings['contentType'];
                }

                console.log('loading fuck 3.. ', resource.route)

                $.ajax(ajaxSettings);

                console.log('loading fuck 4.. ', resource.route)
            }
        });
    }


    Post = (resource, data) => {
        let that = this;
        if (this.State.Settings.cache.enabled && this.State.Settings.cache.localStorage){
            return that.localStorageTryCachedPost(resource, data, that.DirectPost)
        } else if (this.State.Settings.cache.enabled && this.State.Settings.cache.indexedDB) {
            return this.indexedDBTryCachedPost(resource, { urlParams: urlParams, type: type }, that.DirectPost)
        } else {
            return this.DirectPost(resource, data);
        }
    }


    Get = (resource, { urlParams = null, type = 'json' }) => { // TODO remove type, resource already have it.
        if (this.State.Settings.debug){
            console.log('Get: ', resource);
        }
        let that = this;
        if (this.State.Settings.cache.enabled && this.State.Settings.cache.localStorage){
            return this.localStorageTryCachedGet(resource, { urlParams: urlParams, type: type, cacheStorage: that.LocalStorage }, that.DirectGet)
        } else if (this.State.Settings.cache.enabled && this.State.Settings.cache.indexedDB) {
            return this.indexedDBTryCachedGet(resource, { urlParams: urlParams, type: type, cacheStorage: that.indexedDB }, that.DirectGet)
        } else {
            return this.DirectGet(resource, { urlParams: urlParams, type: type, cacheStorage: null });
        }
    }
}
