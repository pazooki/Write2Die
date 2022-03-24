export default class Home {
    constructor(State){
        this.State = State
        this.resources = [];
        this.title = this.State.Root.Services.Localization.i18n('Mehrdad Pazooki')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Mehrdad Pazooki'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','))
    }
    
    run = () => {
        return new Promise( 
            resolve => {
                this.State.Root.Memory.test = 'passed from Home of Rainbow';
                this.State.Root.Services.Search.setupSearchAutoComplete('searchDataListCenterOptions', 'searchDataListCenter');
                return resolve('Successfull Run. App: Home');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
