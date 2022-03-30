export default class Access {
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
                let that = this;
                this.State.Root.Memory.test = 'passed from Access';
                // alert(this.State.Root.Memory.test);


                document.getElementById('login_btn').addEventListener('click', function () {
                    let auth_payload = {
                        email: document.getElementById('email_login_0').value || null, 
                        password: document.getElementById('password_login_0').value || null,
                    }
                    console.log('net::posting ', auth_payload)
                    that.State.Root.Services.Auth.authenticateUser(auth_payload)
                });

                document.getElementById('register_btn').addEventListener('click', function () {
                    let password_0 = document.getElementById('password_register_0').value || null
                    let password_1 = document.getElementById('password_register_1').value || null
            
                    if (password_0 != password_1) {
                        let err_msg = 'Password is not matched with confirmation password.';
                        that.State.Root.Services.Component.toast(err_msg);
                        throw (new Error(err_msg))
                    }
            
                    let register_payload = {
                        fullname: document.getElementById('name_login_0').value || null, 
                        email: document.getElementById('email_register_0').value || null, 
                        password: password_0 || null,
                        agreement: document.getElementById('agreement_register_0').checked || null
                    }
                    that.State.Root.Services.Auth.registerUser(register_payload)
                })

                return resolve('Successfull Run. App: Home/Access');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }

}
