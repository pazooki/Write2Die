export class Auth{
    static LOGOUT_ACTION = 'out';
    static LOGIN_ACTION = 'in';

    constructor(State){
        this.State = State;
    }
    authenticateUser = (authPayload) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.auth, authPayload, {}).then(userData => {
            this.State.Root.Services.Data.API.storeUserData(userData);
        }, reject => {
            console.log('User is not Signed In.', reject);
        });
    }

    getUserData = () => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.user, {debug: false});
    }

    userIsSignedIn = () => {
        if (this.State.Root.Services.Data.Cookies.getUserUUID() !== undefined && this.State.Root.Services.Data.Cookies.getUserUUID() !== null && this.State.Root.Services.Data.Cookies.getUserUUID() !== '') {
            return true;
        } else {
            return false;
        }
    }


    signOut = () => {
        let data = { 'uuid': this.State.Root.Services.Data.Cookies.getUserUUID(), 'action': Auth.LOGOUT_ACTION };
        let currentParams = this.State.Root.Services.Session.getUrlParamsAsADict();
        this.State.Root.Services.Data.API.Post(this.State.Routes.API.user, data, {}).then((data) => {
            this.State.Root.Services.Data.API.flushStoredUserData(data);
            window.location.href = this.State.Root.Services.Session.routeWithParams(this.State.Routes.Site, currentParams);
            window.location.reload();
        });
    }

    flushStoredUserData = (data) => {
        if (data.status === 'out') {
            this.State.Root.Services.Data.Cookies.setCookie('uuid', null, 0);
            localStorage.setItem('user', null);
        }
    }

    storeUserData = (userData) => {
        if (userData !== null && userData !== undefined) {
            this.State.Root.Services.Cookies.setCookie('uuid', userData.uuid);
        }
    }

    getUserDataFromStorage = () => {
        return JSON.parse(localStorage.getItem('user'));
    }
}