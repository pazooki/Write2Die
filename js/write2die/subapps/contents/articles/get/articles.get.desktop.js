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
                let that = this;
                this.State.Root.Memory.test = 'passed from Articles';

                this.setupArticlPostInitEvent();

                // this.State.SubApp.Services.Articles.useAllArticles( function (articles) {
                //     articles.forEach(article => {
                //         this.State.Root.Services.Component.addTolistGroupItem('live_articles_list_group', 
                //             article.title, 
                //             article.published_at, 
                //             article.short_desc, 
                //             article.subnote, 
                //             article.views
                //         )
                //     })
                // })
                return resolve('Successfull Run. App: Articles');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }

    setupArticlPostInitEvent = () => {
        let that = this;
        document.getElementById('article_post_btn').addEventListener('click', function() {
            that.State.SubApp.Services.Articles.requestToCreateANewArticle().then(article_obj => {
                let routeTo = new URL(window.location.origin + that.State.Routes.SubApps["articles.edit"].route );
                console.log( article_obj.meta.uuid);
                that.State.Root.Services.Session.goTo(
                    routeTo,
                    {'uuid': article_obj.meta.uuid}
                )
            })
        })
    }
}

