import { Trout } from './trout/trout.js';


export class TroutJS extends Trout {
    constructor(imports, config) {
        super(imports, config)
        this.config = config;

        this.setupRouter();
        this.setupRootState();
        this.setupSubAppState();

        window.Trout = this;
    }

    setupRouter = () => {
        this.State.Root.Router = new this.State.Root.Modules.RootServices.Router(this.config);
        this.State.Routes = this.config.routes;
    }

    setupRootState = () => {
        this.State.Root.Services.Session = new this.State.Root.Modules.RootServices.Session(this);
        this.State.Root.Services.Session.detectDevice();
        this.beforeLoading();

        this.State.Root.Services.Data = new this.State.Root.Modules.RootServices.Data(this.State);

        this.State.Root.Services.Auth = new this.State.Root.Modules.RootServices.Auth(this.State);
        this.State.Root.Services.Network = new this.State.Root.Modules.RootServices.Network(this.State);

        this.State.Root.Services.Fonts = new this.State.Root.Modules.RootServices.Fonts(this.State);

        this.State.Root.Services.Component = new this.State.Root.Modules.RootServices.Component(this.State);
        this.State.Root.Services.Messaging = new this.State.Root.Modules.RootServices.Messaging(this.State);
        this.State.Root.Services.Tracker = new this.State.Root.Modules.RootServices.Tracker(this.State);
        this.State.Root.Services.Subscription = new this.State.Root.Modules.RootServices.Subscription(this.State);
        this.State.Root.Services.Search = new this.State.Root.Modules.RootServices.Search(this.State);
        this.State.Root.Services.Utils = new this.State.Root.Modules.RootServices.Utils(this.State);

        this.State.Root.Services.Events = new this.State.Root.Modules.Events(this.State);
        
        this.State.Root.Services.Localization = new this.State.Root.Modules.RootServices.Localization(this.State);
    }

    setupSubAppState = () => {
        // this.State.SubApp.Services = new this.State.Root.Modules.SubAppServices;
        this.State.SubApp.Services.Editor = new this.State.Root.Modules.SubAppServices.Editor(this.State);
        this.State.SubApp.Services.Chat = new this.State.Root.Modules.SubAppServices.Chat(this.State);
        this.State.SubApp.Services.Notification = new this.State.Root.Modules.SubAppServices.Notification(this.State);

        this.State.SubApp.Services.Articles = new this.State.Root.Modules.SubAppServices.Articles(this.State);
    }

    afterLoadingApp = () => {
        this.State.Root.Services.Session.navigationEventListener();
        this.State.Root.Services.Session.routingFromAppContentListener();
    }

    beforeLoading = () => {
        
    }

    afterLoadingSubApp = () => {
        console.log('Successfully Loaded Sub App');
        this.State.Root.SessionHistory.RegisteredSubAppEvents = {};
        if (!this.State.debug){
            this.State.Root.Services.Events.setup();
            if (this.State.Config.settings.localization.enabled) {
                this.State.Root.Services.Localization.setup();
            } else {
                this.State.Root.Services.Localization.disable();
            }
        }
        this.State.Root.Services.Session.routingFromSubAppContentListener();
        this.performanceReport();
        // this.State.Root.Services.Tracker.start(); // TODO: fix reseting results
    }


    performanceReport = () => {
        this.performance.end = Date.now();
        this.performance.loadedAfter = this.performance.end - this.performance.start;
        console.log('Performance:', this.performance);
        this.performance.start = Date.now();
        this.performance.end = 0;
        this.performance.loadedAfter = 0;
    }

    get shortcuts () {
        let that = this;
        return {
            cache: {
                local: async function(){ 
                    await that.State.Root.Services.Data.Caching.getLocalCacheTable().then(cacheTable => {
                        console.log(cacheTable);
                    })
                }, 
                server: async function(){ 
                    await that.State.Root.Services.Data.Caching.getServerCacheTable().then(cacheTable => {
                        console.log(cacheTable);
                    })
                },
                LocalStorage: {
                    remove: function(key){ 
                        that.State.Root.Services.Cache.LocalStorage.removeFromCache(key);
                    },
                    get: function(key){ 
                        return that.State.Root.Services.Cache.LocalStorage.get(key);
                    }
                }
            },
            lang: { 
                edit: async function(hash_id, text, lang='fa'){
                    await that.State.Root.Services.Data.API.Post(that.State.Routes.API.service_localization_update, 
                            {"hash_id":hash_id,"lang": lang,"text": text}
                    , {}).then(result => {
                        console.log('dropping', hash_id, result);
                        that.shortcuts.lang.drop(hash_id);
                    });
                },
                drop: async function(key){
                    await that.State.Root.Services.Data.DB.Tables.Localization.then(db => {db.delete('Localization', key)});  
                },
                get: async function(key){
                    await that.State.Root.Services.Data.DB.Tables.Localization.then(db => {db.get('Localization', key).then(r => {console.log(r)})});  
                },
                apiGet: async function(hash_id){
                    await that.State.Root.Services.Data.API.Get(that.State.Routes.API.service_localization_update, 
                            {urlParams: { "hash_id": hash_id }}
                    , {}).then(result => {
                        console.log('localization', result);
                    });
                },
                invalidate: async function(hash_ids, lang){
                    for (let hash_id of hash_ids) {
                        await that.State.Root.Services.Data.API.Post(that.State.Routes.API.service_localization_update, 
                            {"hash_id":hash_id, "lang": lang, "text": text}
                    , {}).then(result => {
                        console.log('dropping', hash_id, result);
                        that.shortcuts.db.lang.drop(hash_id);
                    });
                    }
                }
            }
        }
    }
    static launch = (config_path) => {
        fetch(config_path).then( response => { // Loading config.json file into config obj
            response.json().then( config => {
                console.log(config);
                TroutJS.depencencies([
                    // import('./trout/services/miscs/router.js'),
                    import('./trout/services/root_services.js'),
                    import('./' + config.settings.appName + '/services/subapp_services.js'),
                    import('./trout/events.js'),
                ]).catch(reason => {
                    console.log(reason);
                }).then((imports) => {
                    const myapp = new TroutJS(
                        imports, 
                        config
                    );
                    // see if pathname of url is a valid subapp
                    let _url = new URL(window.location.href);
        
                    myapp.State.Root.Services.Session.route({subAppPath: _url.pathname});
                });
            });
        });
    }

    static ready = (fn) => {
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // call on next available tick
            setTimeout(fn, 1);
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

}
