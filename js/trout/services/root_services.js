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

let RootServices = {
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
}

export {
    RootServices
}