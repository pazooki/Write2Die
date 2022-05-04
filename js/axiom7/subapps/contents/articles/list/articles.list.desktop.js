
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
                alert('Test 1')
                this.State.SubApp.Services.Articles.getUserArticlesSortedByTime(function(articles){
                    console.log('articles: ', articles)
                })
                return resolve('This is a template subapp script');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
