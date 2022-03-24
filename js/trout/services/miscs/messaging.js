export class Messaging {
    constructor(State) {
        this.State = State;
        this.unreadMessageCounter = 0;
    }
    updateCounterBadge = () => {
        var unreadMessageCounterBadge = document.getElementById('messages-unread-counter');
        unreadMessageCounterBadge.innerText = this.unreadMessageCounter;
    }

    countUnreadNotifications = () => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.service_messaging_notification, {});
    }

    countUnreadChat = () => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.service_messaging_chat, {});
    }

    refresh = () => {
        Promise.all([this.countUnreadNotifications(), this.countUnreadChat()]).then((responses) => {
            responses.map(response => {
                this.unreadMessageCounter += Object.values(response).filter((v) => { return v.status === 'unread'}).length;
            });
        }).then(() => {
            this.updateCounterBadge();
        });
    }

}
