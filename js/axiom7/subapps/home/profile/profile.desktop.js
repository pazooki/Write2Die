export default class Home {
    constructor(State){
        this.State = State
        this.resources = [];
        this.title = this.State.Root.Services.Localization.i18n('Write 2 Die')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Free Speech Platform'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','))
    }
    
    run = () => {
        return new Promise( 
            resolve => {
                this.State.Root.Memory.test = 'passed from Profile';
                let that = this;
                let user = this.State.Root.Services.Auth.getUserDataFromStorage();
                that.fillOutProfileForm(user)
                document.getElementById('profile_sign_out_btn').addEventListener('click', that.State.Root.Services.Auth.signOut);
                document.getElementById('profile_update_btn').addEventListener('click', function() {
                    that.State.Root.Services.Auth.updateUser(that.getProfilePayloadObj());
                });
                
                return resolve('Successfull Run. App: Home');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }

    getProfilePayloadObj = () => {
        let payload = {
            'action': 'update',
            'email': document.getElementById('profile_email').value,
            'fullname': document.getElementById('profile_fullname').value,
            'password': document.getElementById('profile_password').value,
            'uuid': this.State.Root.Services.Data.Cookies.getUserUUID()
        };
        return payload
    }

    fillOutProfileForm = (user) => {
        document.getElementById('profile_email').value = user.email;
        document.getElementById('profile_fullname').value = user.fullname;
        document.getElementById('profile_password').value = user.password;
    }

}
