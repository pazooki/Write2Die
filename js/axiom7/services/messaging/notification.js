export class Notification {
    constructor(State) {
        this.State = State;

    }
    static getNotifications = () => {
        return this.State.Root.Services.Data.Get(this.State.Routes.service_messaging_notification, {});
    }

    static postNotification = (head, msg) => {
        let notificationObject = {
            'head': head,
            'msg': msg,
            'status': 'unread',
        }
        return this.State.Root.Services.Data.Post(this.State.Routes.service_messaging_notification, notificationObject, {});
    }
    static markNotificationAsRead = (id) => {
        return this.State.Root.Services.Data.Post(this.State.Routes.service_messaging_notification, { 'status': 'read', 'id': id }, {});
    }
}
