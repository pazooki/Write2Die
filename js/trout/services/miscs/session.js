export class Session {
    constructor(App) {
        this.App = App;
        this.subApp = this.getCurrentSubAppName();
        // console.log('Initializing Session.');
    }

    route = ({subAppName = null, session_id = null}) => {
        // Load App
        // Load Sub App
        this.forwardRoute({subAppName: subAppName , session_id: session_id});
        if (!this.App.State.Root.TroutModulesLoaded) {
            this.App.loadAppModules().then(
                results => {
                    if (this.App.State.Settings.debug){
                        console.log('loadAppModules:', results);
                        console.log('route.LoadAppModules Completed', results);
                    }
                    this.App.State.Root.TroutModulesLoaded = true;
                    this.App.afterLoadingApp();
                    this.App.loadSubAppModules();
                },
                rejects => {
                    console.log(rejects);
                }
            );
        } else {
            this.App.removeSubAppResources(); // Clean up resources from previous route, Root level resources this.App remains
            this.App.afterLoadingApp();
            this.App.loadSubAppModules();
        }
    }

    forwardRoute = ({subAppName = null, session_id = null}) => {
        // Assumption: if subAppName is given then treat it as _url, build a URL

        // [1-] process pathname with params # format dir/subappname?param1=x&paramN=N || dir/subappname/?param1=x&paramN=N
        // [2-] proccess subAppName with params
        // [3-] separate subappname from params
        // update sessionhistory
        // [4-] validate route to content exists
        // [5-] route to subapp
        // [6-] pass params to subapp using session history
        // [7-] update _url with subappname & params

        console.log('Forward Route: ', subAppName);

        if (session_id !== null) {
            this.App.State.Root.SessionHistory.CurrentSession = this.App.State.Root.SessionHistory.Sessions.find(
                session => session.uuid === session_id
            );
            window.history.pushState({
                'session_id': this.App.State.Root.SessionHistory.CurrentSession.uuid
                }, 
                'TOBESET', 
                this.App.State.Root.SessionHistory.CurrentSession.URL
            );
            return;
        } // early exit

        let _url;
        try {
            if (subAppName !== null){
                console.log('URL has a route', subAppName);
                _url = new URL(window.location.origin);
                _url.pathname = subAppName.split('?')[0];
                if(subAppName.indexOf('?') >= 0){
                    _url.search = subAppName.split('?')[1];
                }
                if (!_url.pathname.endsWith('/')){
                    _url.pathname += '/';
                }
            } else {
                console.log('Redirecting to Default Route - Invalid SubApp Name', subAppName);
                subAppName = this.App.State.Settings.DefaultSubApp;
            }
        } catch (error) {
            _url = new URL(window.location);
        }

        if (_url.pathname === '/'){
            _url.pathname = this.App.State.Settings.DefaultSubApp;
        }
        
        console.log('Finalized Route: ', _url.pathname);
        this.App.State.Root.SessionHistory.CurrentSession.SubApp = _url.pathname;
        this.App.State.Root.SessionHistory.CurrentSession.TS = Date.now();
        this.App.State.Root.SessionHistory.CurrentSession.URL = _url;


        if (this.App.State.Settings.debug){
            console.log(this.App.State.Root.SessionHistory.CurrentSession);
        }
        
        if (this.validateRoute()){
            let uuid = this.App.State.Root.Services.Data.Cookies.makeUUID();
            this.App.State.Root.SessionHistory.CurrentSession.uuid = uuid;
            this.App.State.Root.SessionHistory.Sessions.push(JSON.parse(JSON.stringify(this.App.State.Root.SessionHistory.CurrentSession)));
            window.history.pushState({
                'session_id': this.App.State.Root.SessionHistory.CurrentSession.uuid
                }, 
                'TOBESET', 
                this.App.State.Root.SessionHistory.CurrentSession.URL
            );
        }
    }

    get currentSessionSearchParams (){
        return new URLSearchParams((new URL(this.App.State.Root.SessionHistory.CurrentSession.URL)).searchParams);
    }

    validateRoute = () => {
        console.log('validateRoute: ', this.App.State.Root.SessionHistory.CurrentSession.SubApp);
        if(!Object.keys(this.App.subapps).includes(this.App.State.Root.SessionHistory.CurrentSession.SubApp)){
            alert('Invalid Route: ' + this.App.State.Root.SessionHistory.CurrentSession.SubApp);
            // this.forwardRoute({subAppName: this.App.State.Root.SessionHistory.DefaultSubApp});
        } else {
            return true;
        }
    }

    navigate = () => {
        let currentSession = this.App.State.Root.SessionHistory.CurrentSession;
        let currentSessionIdx = this.App.State.Root.SessionHistory.Sessions.findIndex(session => session.uuid === currentSession.uuid);
        let forward = null;
        let back = null;
        if (this.App.State.Root.SessionHistory.Sessions.length > currentSessionIdx) {
            forward = this.App.State.Root.SessionHistory.Sessions[currentSessionIdx + 1];
        }
        if (currentSessionIdx > 0){
            back = this.App.State.Root.SessionHistory.Sessions[currentSessionIdx - 1];
        }
        let Navigation = {
            Forward: forward,
            Back: back,
        }
        // console.log('Navigation', Navigation, this.App.State.Root.SessionHistory);
        return Navigation;
        
    }

    backEvent = (that) => {
        let Navigation = that.navigate();
        if (Navigation.Back !== null && Navigation.Back !== undefined){
            that.route({session_id: Navigation.Back.uuid});
        }
    }

    forwardEvent = (that) => {
        let Navigation = that.navigate();
        if (Navigation.Forward !== null && Navigation.Forward !== undefined){
            that.route({session_id: Navigation.Forward.uuid});
        }
    }

    navigationEventListener = () => {
        let that = this;
        if (that.isMobile()){ // TODO: Only  add one event
            document.getElementById('navigation-back').addEventListener('click', function(e){ that.backEvent(that)}, false)
            document.getElementById('navigation-forward').addEventListener('click', function(e){ that.forwardEvent(that)}, false)
        }
        window.onpopstate = function(){that.backEvent(that)};
    }

    routingFromSubAppContentListener = () => {
        let that = this;
        let subappRefs = document.getElementById('subapp').querySelectorAll('[subapp]');

        if (this.App.State.Settings.debug){
            console.log(subappRefs);
        }
        let uniqueIdx = 0;
        for (let subappRef of subappRefs){
            uniqueIdx += 1;
            if (that.App.State.Root.SessionHistory.RegisteredSubAppEvents[subappRef + uniqueIdx] === undefined){
                that.App.State.Root.SessionHistory.RegisteredSubAppEvents[subappRef + uniqueIdx] = {
                    'subapp': subappRef,
                    'uid': uniqueIdx,
                    'event': 'routingFromContentListener'
                };
                subappRef.addEventListener('click', function (event) {

                    if (that.App.State.Settings.debug){
                        console.log('Route To', subappRef.getAttribute('subapp'));
                    }
                    console.log('SubApp Click Listener: ', subappRef.getAttribute('subapp'))
                    that.route({subAppName: subappRef.getAttribute('subapp')});
                }, false);
            }
        }
    }

    routingFromAppContentListener = () => {
        let that = this;
        let subappRefs = document.querySelectorAll('[subapp]');
        let uniqueIdx = 0;
        for (let subappRef of subappRefs){
            uniqueIdx += 1;
            if (that.App.State.Root.SessionHistory.RegisteredAppEvents[subappRef + uniqueIdx] === undefined){
                that.App.State.Root.SessionHistory.RegisteredAppEvents[subappRef + uniqueIdx] = {
                    'subapp': subappRef,
                    'uid': uniqueIdx,
                    'event': 'routingFromContentListener'
                };
                subappRef.addEventListener('click', function (event) {
                    if (that.App.State.Settings.debug){
                        console.log('Route To', subappRef.getAttribute('subapp'));
                    }
                    that.route({subAppName: subappRef.getAttribute('subapp')});
                }, false);
            }
        }
    }
    setSessionDetails = (title, description_values, keywords_values) => {
        document.title = title;
        var description = document.querySelector('meta[name="description"]');
        description.setAttribute("content", description.attributes.getNamedItem('content').nodeValue + description_values);
        var keywords = document.querySelector('meta[name="keywords"]');
        keywords.setAttribute("keywords", keywords.attributes.getNamedItem('content').nodeValue + keywords_values);
    }

    setParams = (keyValues, reload = false) => {
        var _url = new URL(this.Router.site__index._url);
        for (let [key, value] of Object.entries(keyValues)) {
            key = encodeURIComponent(key);
            value = encodeURIComponent(value);
            _url.searchParams.set(key, value);
        }
        if (reload) {
            window.location.href = _url.href;
        } else {
            return _url;
        }
    }

    getCurrentSubAppName = () => {
        return this.App.State.Root.SessionHistory.CurrentSession.SubApp;
    }

    isMobile = () => {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                navigator.userAgent.substr(0, 4))) {
            return true;
        } else {
            return false;
        }
    }

    detectDevice = () => {
        this.App.State.Root.SessionHistory.Device = this.isMobile() === true ? 'mobile' : 'desktop' ;
        this.setupForMobileOrDesktop();
    }

    setupLocalization = () => {
        this.App.State.Root.Services.Localization.setup();
    }

    setupForMobileOrDesktop = () => {
        if (this.isMobile()) {
            console.log('Mobile Detected.')
            this.App.State.Root.SessionHistory.Device = 'mobile';
            for (let el of document.querySelectorAll('.desktop')) {
                el.parentNode.removeChild(el);
                // el.style.display = 'hidden'
            }
            // for (let el of document.querySelectorAll('.mobile')) {
            //     el.style.display = 'visible'
            //     // el.parentNode.removeChild(el);
            // }
        } else {
            console.log('Desktop Detected.')
            this.App.State.Root.SessionHistory.Device = 'desktop';
            for (let el of document.querySelectorAll('.mobile')) {
                // el.style.display = 'hidden'
                el.parentNode.removeChild(el);
            }
            // for (let el of document.querySelectorAll('.desktop')) {
            //     // el.parentNode.removeChild(el);
            //     el.style.display = 'visible'
            // }
        }
    }

    routeWithParams = (resource, params) => {
        let route_with_params = new URL(resource.route);
        for (let [key, value] of Object.entries(params)) {
            route_with_params.searchParams.delete(key);
            route_with_params.searchParams.set(key, value);
        }
        return route_with_params.href;
    }

    // getUrlParamsAsADict = () => {
    //     return Object.fromEntries((new URLSearchParams(window.location.search)).entries());
    // }

    // currentRouteForForwardParam = () => {
    //     return decodeURI((new URL(window.location.href)).pathname + (new URL(window.location.href)).search);
    // }

    // getParam = (key) => {
    //     var _url = new URL(window.location.href);
    //     return _url.searchParams.get(key);
    // }
}
