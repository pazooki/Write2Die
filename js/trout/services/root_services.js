import { Data } from './data/data.js';
import { Messaging } from './miscs/messaging.js';
import { Subscription } from './miscs/subscription.js';
import { Tracker } from './miscs/tracking.js';
import { Search } from './miscs/search.js';
import { Component } from './miscs/components.js';
import { Network } from './miscs/network.js';
import { Auth } from './miscs/auth.js';
import { Session } from './miscs/session.js';
import { Localization } from './miscs/localization.js';
import { Router } from './miscs/router.js';
import { Utils } from './miscs/utils.js';
import { Fonts } from './miscs/fonts.js';

let RootServices = {
    Router: Router,
    Data: Data,
    Auth: Auth,
    Network: Network,
    Localization: Localization,
    
    Session: Session,

    Component: Component,
    Messaging: Messaging,
    Tracker: Tracker,
    Subscription: Subscription, 
    Search: Search,
    Utils: Utils,
    Fonts: Fonts
}

export {
    RootServices
}