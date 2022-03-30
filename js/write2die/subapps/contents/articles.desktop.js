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

                this.State.Root.Services.Articles.useAllArticles( function (articles) {
                    articles.forEach(article => {
                        this.State.Root.Services.Component.addTolistGroupItem('live_articles_list_group', 
                            article.title, 
                            article.published_at, 
                            article.short_desc, 
                            article.subnote, 
                            article.views
                        )
                    })
                })
                return resolve('Successfull Run. App: Articles');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
    
    getArticlePostFormPayload = () => {
        return {
            'title': document.getElementById('article_title'),
            'published_at': document.getElementById('article_published_at'),
            'short_desc': document.getElementById('article_description'),
            'subnote': document.getElementById('article_subnote')
        }
    }
}
