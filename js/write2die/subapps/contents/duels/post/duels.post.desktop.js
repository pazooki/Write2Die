
export default class SubAppBase {
    constructor(State){
        this.State = State
        this.resources = [];
        this.title = this.State.Root.Services.Localization.i18n('Title')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Description Tags'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','))
    }
    
    run = () => {
        return new Promise( 
            resolve => {
                this.State.Root.Memory.test = 'passed from Home';
                // this.State.Root.Services.Search.setupSearchAutoComplete('searchDataListCenterOptions', 'searchDataListCenter');
                return resolve('This is a template subapp script');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
