export class Chat {
    constructor(State) {
        this.State = State;

    }
    static getMessages = () => {
        return this.State.Root.Services.Data.Get(this.State.Routes.service_messaging_chat, {});
    }

    static postMessage = (msg) => {
        let ts = (new Date() * 1000).toString();
        let payload = {};
        payload[ts] = {
            'to': 'support',
            'msg': msg
        };
        return this.State.Root.Services.Data.Post(this.State.Routes.service_messaging_chat, payload, {});
    }

    static markChatAsRead = (id) => {
        return this.State.Root.Services.Data.Post(this.State.Routes.service_messaging_chat, { 'status': 'read', 'id': id }, {});
    }
}

