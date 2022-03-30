export class Auth{
    static LOGOUT_ACTION = 'out';
    static LOGIN_ACTION = 'in';

    constructor(State){
        this.State = State;
    }

    extractNextValue  = () => {
        var _url = new URL(window.location.href);
        var next_value = _url.searchParams.get('next');
        return next_value
    }

    afterActionNext = () =>  {
        var next = [(new URL(window.location.href)).origin, this.extractNextValue()].join('/');
        if (next) {
            window.location.href = next;
        } else {
            window.location.href = that.State.Routes.host;
        }
    }

    authenticateUser = (auth_payload) => {
        let that = this;
        if (that.validate_forms(auth_payload)) {

            that.State.Root.Services.Data.API.DirectPost(that.State.Routes.API.auth, auth_payload, {cacheStorage: null}).then(
                userData => {
                    that.storeUserData(userData);
                    that.afterActionNext()
                }, reject => {
                    let err_msg = 'Could not login with your information.';
                    that.State.Root.Services.Component.toast(err_msg);
                    throw (new Error(err_msg));
                }
            );
        } else {
            let err_msg = 'Some fields for login have wrong value or are left empty.';
            that.State.Root.Services.Component.toast(err_msg);
            throw (new Error(err_msg));
        }
    }

    updateUser = (profile_payload) => {
        let that = this;
        if (that.validate_forms(profile_payload)) {

            console.log('update', profile_payload);
            that.State.Root.Services.Data.API.DirectPost(that.State.Routes.API.user, profile_payload, {}).then(data => {
                if (data.hasOwnProperty('uuid')) {
                    this.storeUserData(data);
                    that.State.Root.Services.Component.toast('Update was successful.');
                } else {
                    let err_msg = 'Update was not successful.';
                    that.State.Root.Services.Component.toast(err_msg);
                    throw (new Error(err_msg));
                }
            }, reason => {
                console.log(reason);
            });

        } else {
            let err_msg = 'Some fields for register form have wrong value or are left empty.';
            that.State.Root.Services.Component.toast(err_msg);
            throw (new Error(err_msg))
        }  
    }
    
    registerUser = (register_payload) => {
        let that = this;
        if (that.validate_forms(register_payload)) {
            
            console.log('signup', register_payload);
            that.State.Root.Services.Data.API.DirectPost(that.State.Routes.API.signup, register_payload, {}).then(data => {
                if (data.hasOwnProperty('uuid')) {
                    this.storeUserData(data);
                    this.afterActionNext()
                } else {
                    let err_msg = 'Signup was not successful.';
                    that.State.Root.Services.Component.toast(err_msg);
                    throw (new Error(err_msg));
                }
            }, reason => {
                console.log(reason);
            });

        } else {
            let err_msg = 'Some fields for register form have wrong value or are left empty.';
            that.State.Root.Services.Component.toast(err_msg);
            throw (new Error(err_msg))
        }
    }

    signOut = () => {
        let data = { 'uuid': this.State.Root.Services.Data.Cookies.getUserUUID(), 'action': Auth.LOGOUT_ACTION };
        // let currentParams = this.State.Root.Services.Session.getUrlParamsAsADict();
        
        this.State.Root.Services.Data.API.Post(this.State.Routes.API.user, data, {}).then((data) => {
            this.flushStoredUserData(data);
            this.afterActionNext()
        });
    }


    validate_forms = (payload)  => {
        // All keys must have a value set
        for (var key in payload) {
            if (Object.prototype.hasOwnProperty.call(payload, key)) {
                var val = payload[key];
                console.log(key, val)
                if (val === null || val === undefined || val == '' || !val) {
                    return false;
                }
            }
        }
        return true;
    }


    getUserData = () => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.user, {debug: false});
    }

    updateSiteWithUserInfo = () => {
        let user = this.getUserDataFromStorage();
        
    }


    getUserData = () => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.user, {debug: false});
    }

    userIsSignedIn = () => {
        let uuid = this.State.Root.Services.Data.Cookies.getUserUUID();
        if (uuid !== undefined && uuid !== null && uuid !== '') {
            return true;
        } else {
            return false;
        }
    }


    flushStoredUserData = (data) => {
        if (data.status === 'out') {
            this.State.Root.Services.Data.Cookies.setCookie('uuid', null, 0);
            localStorage.setItem('user', null);
        }
    }

    storeUserData = (userData) => {
        if (userData !== null && userData !== undefined) {
            this.State.Root.Services.Data.Cookies.setCookie('uuid', userData.uuid);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    }

    getUserDataFromStorage = () => {
        return JSON.parse(localStorage.getItem('user'));
    }
}