import { TroutJS } from './js/trout.js';

TroutJS.ready(function () {
    let app = {
        appName: 'write2die',
        server:'http://localhost:8080',

        settings:{
            debug: true,
            cache: {
                enabled: false, 
                localStorage: false, 
                indexedDB: false
            },
            localization: {
                enabled: false,
                default: 'en',
                languages: {
                    'en': { 'name': 'English', 'code': 'en', 'flag': '🇨🇦' },
                    'zh': { 'name': 'Chinese', 'code': 'zh', 'flag': '🇨🇳' },
                    'hi': { 'name': 'Hindi', 'code': 'hi', 'flag': '🇮🇳' },
                    'es': { 'name': 'Spanish', 'code': 'es', 'flag': '🇪🇸' },
                    'pt': { 'name': 'Portuguese', 'code': 'pt', 'flag': '🇵🇹' },
                    'bn': { 'name': 'Bengali', 'code': 'bn', 'flag': '🇮🇳' },
                    'ru': { 'name': 'Russian', 'code': 'ru', 'flag': '🇷🇺' },
                    'ja': { 'name': 'Japanese', 'code': 'ja', 'flag': '🇯🇵' },
                    'fa': { 'name': 'Farsi', 'code': 'fa', 'flag': '🇮🇷' },
                    'ar': { 'name': 'Arabic', 'code': 'ar', 'flag': '🇮🇶' },
                }
            },
            DefaultSubApp: '/home/home/', // TODO: IMPORTANT: All links get redirected to DefaultSubApp
        },
        subapps:{ // "filesystem path": "unique subapp identifier"
            "/home/home/": "home",
            "/home/access/": "access",

            "/contents/articles/": "articles",
            "/contents/corresp/": "corresp",
            "/contents/podcasts/": "podcasts",
            "/contents/videos/": "videos",

            "/write2die/test-page-1/": "test1",

            "/invalid/invalid/": "invalid"
        },

    }
    TroutJS.launch(app)
});
