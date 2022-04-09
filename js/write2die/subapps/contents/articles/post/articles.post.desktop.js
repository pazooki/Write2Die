export default class ArticlesPost {
    /*
        1- evrytime user views Article.Post a new article is created in the backend and 
        its object with uuid gets here and any changes will be saved as the same article
        post object with the same uuid

    */


    constructor(State){
        this.State = State
        this.resources = ["Editor"];
        this.title = this.State.Root.Services.Localization.i18n('Title')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Description Tags'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','));
        this.State.Root.Memory.Articles = {
            new: {}
        };
    }
    
    run = () => {
        let that = this;
        return new Promise( 
            resolve => {

                // if (window.location.search != null) {
                //     let queryParam = this.State.Root.Services.Session.getParam('q');
                //     console.log('queryParam: ', queryParam);
                //     this.State.SubApp.Services.Articles.getArticleByUrl(queryParam).then( article_obj => {
                //         that.loadEditor(article_obj);
                //     });
                // } else {

                // }
                let that = this;


                this.editor = this.State.SubApp.Services.Editor.createEditor();

                this.State.SubApp.Services.Articles.requestToCreateANewArticle().then(article_obj => {
                    this.State.Root.Memory.Articles.new = article_obj;
                    this.updateArticle(article_obj);
                    return resolve(article_obj);
                })


                document.getElementById('article_post_save_btn').addEventListener('click', function (){
                    this.State.Root.Services.Sessions.route()
                });
                document.getElementById('article_post_title').addEventListener('change', this.save);

                // this.editor.onChange = this.autoSave;

                // document.getElementById('articles_post_new_btn').addEventListener('click', function(){
                //     that.createANewArticle();
                // });

            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
    
    emptyTitleField = () => {
        let title_field = document.getElementById('article_post_title')
    }

    updateArticle = (article_obj) => {
        console.log(article_obj);
        if (article_obj != null) {
            if(article_obj.article.title){
                document.getElementById('article_post_title').value = article_obj.article.title;
            }
            this.editor.setContents(article_obj.article.content)
            document.getElementById('article_publish_switch').checked = article_obj.article.public;
        }
    }

    // loadMyArticles = () => {
    //     let that = this;
    //     let my_articles_side_list = document.getElementById('my_articles_side_list')
    //     return this.State.SubApp.Services.Articles.getUserArticlesSortedByTime(function(response){
    //         response.forEach(article => {
    //             let article_item = document.createElement('a');
    //             article_item.classList.add(['list-group-item', 'list-group-item-action']);
    //             article_item.innerHTML = article.title;
    //             article_item.addEventListener('click', function(e) {
    //                 article_item.classList.add('active');
    //                 console.log('Article URL: ', article.url)
    //                 window.location.href = '?q=' + article.url;
    //             })
    //             my_articles_side_list.appendChild(article_item);
    //         })
    //         console.log(response);
    //     });
    // }

    getCurrentArticlePayload = () => {
        let article_payload = {
            title: document.getElementById('article_post_title').value || this.State.Root.Memory.Articles.new.title, 
            content: this.editor.getContents(), 
            public: document.getElementById('article_publish_switch').checked,
            url: document.getElementById('article_post_url').value || this.State.Root.Memory.Articles.new.url,
            uuid: document.getElementById('article_post_uuid').value || this.State.Root.Memory.Articles.new.uuid,
            last_modified_at: this.State.Root.Memory.Articles.new.last_modified_at,
            published_at: this.State.Root.Memory.Articles.new.published_at
        };
        return article_payload;
    }

    autoSave = () => {
        let article_payload = this.getCurrentArticlePayload()
        console.log('article_payload ', article_payload)
        this.State.Root.Memory.Articles = article_payload;

        this.State.SubApp.Services.Articles.updateArticleInBackend(article_payload, function(response){
            document.getElementById('article_post_url').value = response.url;
            document.getElementById('article_post_uuid').value = response.uuid;
        });
    }

    
}
