export default class Articles {
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
                this.State.Root.Memory.test = 'passed from Articles';
                // alert(this.State.Root.Memory.test);
                return resolve('Successfull Run. App: Articles');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
