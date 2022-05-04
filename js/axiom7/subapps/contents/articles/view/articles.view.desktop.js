
export default class ArticleView {

    constructor(State) {
        this.State = State
        this.resources = [];
        this.title = this.State.Root.Services.Localization.i18n('Title')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Description Tags'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','));
        this.currentArticleObj = null;
    }

    run = () => {
        return new Promise(
            resolve => {
                let that = this;

                if (window.location.search == null) {
                    alert('There is no valid article in the url.')
                } else {
                    let article_url = this.State.Root.Services.Session.getParam('article');
                    console.log('queryParam: article_url: ', article_url);
                    this.State.SubApp.Services.Articles.getArticleByTitleUrl(article_url).then(article_obj => {
                        that.currentArticleObj = article_obj;
                        that.load(article_obj);
                    });
                }
                return resolve('Article.Edit Successful');
            },
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }

    load = (article_obj) => {
        if (article_obj.meta.public) {
            document.getElementById('article_title').innerHTML = article_obj.article.title;
            document.getElementById('article_description').innerHTML = article_obj.article.description;
            document.getElementById('article_content').innerHTML = article_obj.article.content;
        }
    }
};