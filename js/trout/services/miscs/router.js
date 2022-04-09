class Router {
    constructor(config) {
        this.config = config;
    }

    get policies() {
        return {
            Time: {
                RESET: 1,
                ZERO: 0, // ZERO-CACHE-POLICY
                Second: 1000,
                Minute: 1000 * 60,
                Hour: (1000 * 60) * 60,
                Day: ((1000 * 60) * 60) * 24,
                Month: (((1000 * 60) * 60) * 24) * 30,
                Year: (((((1000 * 60) * 60) * 24) * 30) * 12),
                //          1 Minute     1Hr  1Day 1Month 1Year
            },
            Compression: {
                SizeLargerThanBytes: 128, // Bytes
            }
        }
    }

    SubAppResources = (subAppPath, SubApp_FileName, device) => { // removing trailing slash from subapppath
        let subAppCSS = '/css/subapps' + subAppPath + SubApp_FileName + '.' + device + '.css';
        let subAppHTML = '/html/subapps' + subAppPath + SubApp_FileName + '.' + device + '.html';
        console.log('SubApp CSS', subAppCSS, subAppHTML)
        return [
            { route: subAppCSS, cache: { validityTime: this.policies.Time.ZERO } },
            { route: subAppHTML, attributes: { placementTag: 'subapp' }, cache: { validityTime: this.policies.Time.ZERO } },
        ]
    }

    SubAppModule = (subAppPath, SubApp_FileName, device) => {
        let resource = '/js/' + this.config.settings.appName + '/subapps' + subAppPath + SubApp_FileName + '.' + device + '.js';
        console.log('SubAppModule JS: ', resource);
        return { route: resource, cache: { validityTime: this.policies.Time.ZERO } }
    }
}

export {
    Router
}