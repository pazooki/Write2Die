export class Subscription{ // TODO: To be generalized with email for any element
    // dropdown with check mark for email/sms
    // Given a target Placement ID and a target information to subscribe - it places a drop down for subscription or
    // a toast with subscription action
    static Types = {
        COMPANY_PROFILE: 'company-profile',
        COMPANY_DATA: 'company-data',
        COMPANY_DOCUMENTS: 'company-documents',
        FEATURE: 'feature',
        USER_PROFILE: 'user-profile',
    }

    get Types () {
        return Subscription.Types;
    }

    constructor(State){
        this.State = State;
    }

    postSubscription = (type, target_id) => {
        if (!Object.values(Subscription.Types).includes(type)){
            throw new Error(['Invalid Type.', type, target_id]);
        }
        var data = {
            'type': type,
            'target_id': target_id,
            'status': 'active'
        }
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.service_subscription, data, {})
    }

    postUnsubscribe = (type, target_id) => {
        if (!Object.values(Subscription.Types).includes(type)){
            throw new Error(['Invalid Type.', type, target_id]);
        }
        var data = {
            'target_id': target_id,
            'status': 'done',
            'type': type
        }
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.service_subscription, data, {})
    }

    getSubscriptions = () => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.service_subscription, {});
    }

    getSubscription = (subscription_target_id) => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.service_subscription, {urlParams: {'target_id': subscription_target_id}})
    }

    setupSubscribeBtn = (subscription_type, subscription_target_id, notification_head, notification_msg, elId) => {
        let that = this;
        let subscribeBtn = document.getElementById(elId);
        subscribeBtn.addEventListener('click', function (event){
            that.State.Root.Services.Component.Overlay.on();
            that.postSubscription(subscription_type, subscription_target_id).then((value) => {
                that.State.SubApp.Services.Notification.postNotification(notification_head, notification_msg);
                that.changeSubscribeToSubscribed(elId);
            }).then( values => {
                that.State.Root.Services.Component.toast([
                    that.State.Root.Services.Localization.i18n('Subscribed To '), subscription_target_id].concat(' '), 
                    that.State.Root.Services.Component.btn(
                        '/my-portfolio/my-subscriptions/', 
                        that.State.Root.Services.Localization.i18n('View In My Subscriptions', 'en'),
                        'a'
                    )
                );
            });
        });
    }

    isUserSubscribedTo = (subscription_target_id) => {
        return this.getSubscription(subscription_target_id);
    }

    changeSubscribeToSubscribed = (elId) => { // TODO: fix for correct routing with Session
        let subscriptionBtn = document.getElementById(elId);
        let viewSubscriptionsBtn = document.createElement('a');
        viewSubscriptionsBtn.setAttribute('id', 'view-in-my-subscriptions-btn');
        viewSubscriptionsBtn.setAttribute('subapp', '/my-portfolio/my-subscriptions/');
        viewSubscriptionsBtn.classList.remove('btn-primary');
        viewSubscriptionsBtn.classList.add(...['button', 'btn-sm', 'btn-success', 'btn-fill']);
        viewSubscriptionsBtn.innerHTML = this.State.Root.Services.Localization.i18n('View In My Subscriptions', 'en');
        subscriptionBtn.parentNode.appendChild(viewSubscriptionsBtn);
        subscriptionBtn.parentNode.removeChild(subscriptionBtn);
    }
    
}