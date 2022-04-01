export class Trout {
    constructor(imports) {
        this.performance = {
            start: Date.now(),
            end: 0,
            loadedAfter: 0,
        }
        this.State = { 
            Root: {
                AppName: 'Trout',
                TroutModulesLoaded: false,
                SessionHistory: { // Routing happensgetPa through this.State.Root.Services.Session.route(subAppName) where
                    // Load App & Load SubApp Happens
                    Device: 'Desktop',
                    CurrentSession: {
                        URL: null,
                        SubApp: '/home/home/',
                        TS: 0,
                    },
                    RegisteredAppEvents: {},
                    RegisteredSubAppEvents: {},
                    Sessions: [],
                },
                Modules: imports,
                Services: {}, // Requires Instantiation after import
                Memory: {}
            },
            Routes: {}, // After Instantiation Modules.Routes
            SubApp: {
                module: null,
                Services: {}, // override in Tajiran App: Instantiate Class Tree (Manual Dependecy Passing)
            }
        }
    }

    // setupRootState = () => {} // to be overriden by Tajiran App
    // setupSubAppState = () => {} // to be overriden by Tajiran App

    loadSubAppModules = () => {
        // Load Sub App Level Resources
        // Default SubApp Path 
        // [/css/subapps/<subapp-name>/<sub-app>.css, /js/subapps/<subapp-name>/<sub-app>.js, /html/subapps/<subapp-name>/<sub-app>.html]
        //

        console.log('Loading Resources Sub App:', this.State.Root.SessionHistory.CurrentSession.SubApp);
        this.loadResources(this.State.Root.Router.SubAppResources(
            this.State.Root.SessionHistory.CurrentSession.SubApp, this.State.Root.SessionHistory.Device
        )).then(
            results => {
                console.log('Result of LoadApp:', results);
                console.log('Loading Resources SubApp:', this.State.Root.SessionHistory.CurrentSession);

                // Load Sub App Module
                // export default SubApp
                // new SubApp(this.State) # Root Level Manager Passed Down To SubApp
                //
                if (this.State.Settings.debug){
                    console.log(this.State.Root.SessionHistory.CurrentSession.SubApp, this.State.Root.SessionHistory.Device);
                    console.log(this.State.Root.Router.SubAppModule(
                        this.State.Root.SessionHistory.CurrentSession.SubApp, this.State.Root.SessionHistory.Device
                    ).route);
                }
                import(this.State.Root.Router.SubAppModule(
                    this.State.Root.SessionHistory.CurrentSession.SubApp, this.State.Root.SessionHistory.Device
                ).route).then(subAppModule => {
                    this.State.SubApp.module = new subAppModule.default(this.State);


                    // Load Sub App ThirdParty Resources
                    // SubApp.resources
                    // Resources for Sub App are => {'ResourceName': [ {route:...}, {route:...}, ...]}
                    // Needs to resources.filteredByNameAssignedInListInSubApp.Reources.flat()
                    //
                    this.loadResources(this.State.SubApp.module.resources.map(name => {

                        if (this.State.Settings.debug){
                            console.log('Loading SubApp Resource', name)
                        }
                        return this.State.Routes.ThirdPartyModuleResources[name];
                    }).flat().filter(resource => !resource.route.endsWith('.js'))).then(
                        results => {
                            console.log('SubApp Resources: ', results, this.State.SubApp.module.resources);

                            // Sub App.run()
                            // 
                            //


                            if (this.State.Settings.debug){
                                console.log('SubApp ThirdParty Modules Loaded(Non-JS): ', results);
                            }
                            let subappJSResources = this.State.SubApp.module.resources.map(name => {


                                if (this.State.Settings.debug){
                                    console.log('Loading SubApp Resource', name)
                                }
                                let resource = this.State.Routes.ThirdPartyModuleResources[name];

                                if (this.State.Settings.debug){
                                    console.log(resource);
                                }
                                return resource;
                            }).flat().filter(resource => resource.route.endsWith('.js')).map(resource => {
                                return import(resource.route);
                            });
                            Promise.allSettled(subappJSResources).then((results) => {

                                if (this.State.Settings.debug){
                                    console.log(results);
                                }
                                this.State.SubApp.module.run().then(
                                    result => {

                                        if (this.State.Settings.debug){
                                            console.log(result);
                                        }
                                        this.State.Root.Canada001ModulesLoaded = true;
                                        this.afterLoadingSubApp();
                                    },
                                    reject => {
                                        console.log(reject);
                                    }
                                );
                            });
                        },
                        reject => {
                            console.log('SubApp ThirdParty Modules Load Failed: ', reject);
                        }
                    );
                }).catch(err => {
                    console.log(err.stack);
                });
            },
            rejects => {
                console.log(rejects);
            }
        );
    }

    loadAppModules = () => {
        // Load App
        // Load Sub App
        console.log('Loading Resources:', this.State.Root.AppName);
        // Load App Level Resources
        // Default SubApp Path 
        // [/css/subapps/<subapp-name>/<sub-app>.css, /js/subapps/<subapp-name>/<sub-app>.js, /html/subapps/<subapp-name>/<sub-app>.html]
        //
        return this.loadResources(this.State.Routes.Meta);
    }

    removeSubAppResources = () => {
        // TODO: Urgent - Clean up resources for SubApps = Done
        this.State.SubApp.module = null;
    }

    loadResources = (resources) => {
        // console.log('loadResources', resources);
        return this.loadResourcesSequentually(resources.filter(resource => {
            if (!resource.hasOwnProperty('device') || this.State.Root.SessionHistory.Device === resource.device) {
                return resource;
            }
        }));
    }

    loadResourcesSequentually = async (dependencies) => {
        // console.log('Dependencies', dependencies);
        for (let resource of dependencies) {
            const loadedResource = await this.load(resource);
            console.log('loadResourcesSequentually', resource, loadedResource);
        }
        return Promise.resolve(dependencies);
    }

    load = (resource) => {
        return new Promise((resolve, reject) => {
            let type = resource.route.split('.').pop();
            console.log('load()', type, resource);
            switch (type) {
                case 'html':
                    return this.State.Root.Services.Data.API.Get(resource, {}).then(
                        content => {
                            console.log('loading.. ', resource)
                            console.log('loading content.. ', content)
                            document.getElementById(resource.attributes.placementTag).innerHTML = content;
                            return resolve('Loaded HTML: ' + resource.route);
                        },
                        reject => {
                            document.getElementById(resource.attributes.placementTag).innerHTML = 'Failed To Load This Component';
                            console.log('html tag failed to load: ', reject);
                            console.log('Loading Rejected Resource', resource);
                            return Promise.reject(new Error('Failed To Load HTML: ' + resource.route));
                        }
                    )
                case 'js':
                    var script = document.createElement("script");
                    script.type = 'application/javascript';
                    script.src = resource.route;
                    script.addEventListener('load', function (resource) { });
                    script.addEventListener('error', function (e) { });
                    document.head.appendChild(script);
                    return resolve('Loaded JS: ' + resource.route);
                case 'css':
                    var stylesheet = document.createElement('link');
                    stylesheet.setAttribute('rel', 'stylesheet');
                    stylesheet.setAttribute(type, 'text/css');
                    stylesheet.setAttribute('href', resource.route);
                    // console.log(resource);
                    if (resource.hasOwnProperty('attributes')) {
                        for (let [k, v] of Object.entries(resource.attributes)) {
                            stylesheet.setAttribute(k, v);
                        }
                    }
                    stylesheet.addEventListener('load', function (resource) { });
                    stylesheet.addEventListener('error', function (e) { });
                    document.head.appendChild(stylesheet);
                    return resolve('Loaded CSS: ' + resource.route);
                default:
                    return reject(new Error('Failed To Load: ' + resource.route));
            }
        });
    }

    static depencencies = (imports) => {
        return Promise.all(imports).then(
            modules => {
                var appModules = {};
                console.log(modules);
                for (let _exports of modules) {
                    for (let _export of Object.keys(_exports)) {
                        let moduleName = _export;
                        let moduleObj = _exports[moduleName];
                        console.log('Loading: ', moduleName, 'into', _export);
                        appModules[moduleName] = moduleObj;
                    }
                }
                console.log('Loaded App Modules:', appModules);
                return Promise.resolve(appModules);
            },
            rejected => {
                console.log('Failed To Load App Modules:', imports, rejected);
                return Promise.reject(new Error(rejected));
            }
        )
    }
}

