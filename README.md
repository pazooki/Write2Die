# TroutJS

It is fast, highly manuverable, native to the browsers and high performant with handling large datasets.
It is PURE JAVASCRIPT. It requires no packaging nor external app to serve it on a web browser.
It is made as the best friend of developers and browsers.
The architecture of TroutJS allows developers to easily extend its features; the core of the code base is designed to be small and layered.


Table of Contents
-----------------
- TroutJS Architecture
- Quick Tutorial (30 Minutes) *To Explore Main Capabilities*
- In Depth Documentation


## TroutJS architecture

[To Be Added: A Diagram of TroutJS Architecture]

### TroutJS Filesystem
- Controller (Javascript Code)
    - Trout
        - Services
        - Thirdparty libraries
        - Events
        - Router
        - Trout Core
        - Trout Application
    - Sub Apps
        - Mobile
        - Desktop
- View (HTML, CSS)
    - HTML
        - Trout
            - Components
            - Index
        - Sub Apps
            - [Sub App Name]
                - [page].desktop.html
                - [page].mobile.html
    - CSS
        - trout
            - trout.css (Global CSS)
            - thirdparty-libs
                - bootstrap, etc.
        - Sub Apps
            - [Sub App Name]
                - [page].desktop.css
                - [page].mobile.css

- Static (Icon, Images, Static Data)

## TroutJS Design Patterns, Naming Convention and API Navigation

[TO BE COMPLETED]


## Quick Tutorial (30 Minutes) *To Explore Main Capabilities*

In this tutorial you learn how TroutJS gives you the ability to utilize the following features in minutes:

- **TroutJS Applicaiton Serving Enviroment Setup** with *NGINX*
- **A TroutJS Application** with settings
- **Sub Applications and Pages** that includes routing, session management, mobile and desktop compatibility
- **Backend Calls** Using **TroutJS Data API Service** with Auto Caching
- **User Authentication** using **TroutJS Auth Service**
- **Localization** Using **TroutJS Localization Service** and a simple backend server 
- **Dynamic HTML Components Creation** using **TroutJS Components Service**
- **User Tracking** using **TroutJS Tracking Services**
- **Sarch Engine** with **Auto Completion** using **TroutJS Search Service** and *Elastic Search*
- **Thirdparty libraries** setup to use for a page; JQuery, DataTables, ApexChart, Feather, ... [Free to Use any Thirdparty Library]
- **TroutJS Web Console API** for Easy Debugging and Manual Changes of Cache & More in Browser DevTools Console

## Creating your first Application
Create a file in the root directory after cloning the original source code of TroutJS with the name of your application.
Example: we create an application called `rainbow`

```
touch rainbow.js
```

Content of your application:
```javascript
import { TroutJS } from './js/trout.js';

TroutJS.ready(function () {
    let app = {
        appName: 'rainbow',
        server:'http://localhost:8080',
        settings:{
            debug: true,
            cache: {
                enabled: true, 
                localStorage: true, 
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
            }
        },
        subapps:{ // "filesystem path": "unique subapp identifier"
            "/rainbow/home/": "home",
            "/rainbow/contact/": "contact",
            
            "/subapp1/test-page-1/": "test1",
            "/subapp1/test-page-2/": "test2",

            "/invalid/invalid/": "invalid"
        }
    }
    TroutJS.launch(app)
});


```

## Creating your first Subapp
A subapp is a sub application in trout. 

All views in TroutJS are presented through a subapp.

A subapp could have a single page or a group of pages under its routing path.

Example:

Here we have 'subapp1' with two pages;

- https://localhost/subapp1/test-page-1
- https://localhost/subapp1/test-page-2

There are four simple steps to take to create a subapp.
- Step 1: Add a Sub App routing to your TroutJS App
- Step 2: Add Javascript controller for your subapp
- Step 3: Add HTML view for each page
- Step 4: Add Styling for each page

### Step 1: Add a Sub App routing to your TroutJS App

```javascript
TroutJS.ready(function () {
    let app = {
        appName: 'rainbow',
        server:'http://localhost:8080',
        settings:{}, // removed only for this example to be short
        subapps:{ // "filesystem path": "unique subapp identifier"
            "/rainbow/home/": "home",
            "/rainbow/contact/": "contact",

            "/subapp1/test-page-1/": "test1", // <-- Here is adding subapp1 with test-page-1
            "/subapp1/test-page-2/": "test2", // <-- Here is adding subapp1 with test-page-1

            "/invalid/invalid/": "invalid"
        }
    }
    TroutJS.launch(app)
});
```

### Step 2: Add Javascript controller for your subapp

Note that there is one directory '/js/rainbow/subapps/subapp1' that should be created along with 2 javascript file for each page; one file is for mobile view and the other is for desktop. So for two pages of 'test-page-1' and 'test-page-2' a total of 4 files are created.

```
mkdir js/rainbow/subapps/subapp1
touch js/rainbow/subapps/subapp1/test-page-1.desktop.js
touch js/rainbow/subapps/subapp1/test-page-1.mobile.js
touch js/rainbow/subapps/subapp1/test-page-2.desktop.js
touch js/rainbow/subapps/subapp1/test-page-2.mobile.js
```

```
├── js
│   ├── rainbow
│   │   └── subapps
│   │       ├── subapp1
│   │       │   ├── test-page-1.desktop.js
│   │       │   ├── test-page-1.mobile.js
│   │       │   ├── test-page-2.desktop.js
│   │       │   └── test-page-2.mobile.js
```

The content of controller;: test-page-1.mobile.js

```javascript
export default class TestPage1Mobile { // you could set any class name with no restriction, it will be automatically loaded
    constructor(State){
        this.State = State // Gives you access to TroutJS API with many features to code less
        this.resources = []; // here you are able to load javascript libraries per subapp/page which improves performance of your application greately.

        // Setting page HTML DOM variables
        this.title = this.State.Root.Services.Localization.i18n('Title of the page with auto translation')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'A description line'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(',')) // re-using description to make keywords
    }
    
    // Core of your subapp page javascript code
    // It must be written inside a promise for greater performance and better flow control
    run = () => {
        return new Promise( 
            resolve => {
                this.State.Root.Memory.test = 'This message is put into shared memory accessible across the application from test-page-1';
                document.getElementById('content-test').innerHTML = 'This content is set by test-page-1.js'
                return resolve('Successfully ran subapp1/test-page-1');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
```

Note that there is no difference in the structure of a page for desktop. So test-page-1.mobile.js and test-page-1.desktop.js could reuse one another code however if you are interested to make any custom change which is usually the case for either of them separating them gives you the ability to do so.


### Step 3: Add HTML view for each page
```
mkdir html/subapps/subapp1
touch js/subapps/subapp1/test-page-1.desktop.html
touch js/subapps/subapp1/test-page-1.mobile.html
touch js/subapps/subapp1/test-page-2.desktop.html
touch js/subapps/subapp1/test-page-2.mobile.html
```

```
├── html
│   ├── subapps
│   │   ├── subapp1
│   │       │   ├── test-page-1.desktop.html
│   │       │   ├── test-page-1.mobile.html
│   │       │   ├── test-page-2.desktop.html
│   │       │   └── test-page-2.mobile.html
```

The content of view; Example: test-page-1.mobile.html
```html
<div class="row">
    <div class="card-group">
        <div class="card">
            <div class="card-header text-center">
                <h5 class="card-title"><i18n lang="en">Rainbow: Test Page 1</i18n></h5>
            </div>
            <div class="card-body">
                <small id='content-test'></small>
            </div>
        </div>
    </div>
</div>
```
Note that you could use `<i18n></i18n>` tag for auto localization of static content. If you are setting content with your controller javascript file then you could use this API: 

```javascript
this.State.Root.Services.Localization.i18n('Here is your content to be translated')
```

### Step 4: Add Styling for each page
[TO BE COMPLETED]# Write2Die
