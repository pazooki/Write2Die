export default class Home {
    constructor(State){
        this.State = State
        this.resources = [];
        this.title = this.State.Root.Services.Localization.i18n('Tajiran: Home - TSE Tehran Stock Exchange Intelligence Trading Academy & Data')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'TSE Tehran Stock Exchange Intelligence Trading Academy Data'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','))
    }
    
    run = () => {
        return new Promise( 
            resolve => {
                this.State.Root.Memory.test = 'passed from Home';
                this.State.Root.Services.Search.setupSearchAutoComplete('searchDataListCenterOptions', 'searchDataListCenter');
                return resolve('Successfull Run. App: Home');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
