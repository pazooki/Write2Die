export default class ArticleEdit {
    /*
        1- evrytime user views Article.Post a new article is created in the backend and 
        its object with uuid gets here and any changes will be saved as the same article
        post object with the same uuid

    */


    constructor(State){
        this.State = State
        // this.resources = ["Editor"];
        this.title = this.State.Root.Services.Localization.i18n('Title')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Description Tags'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','));
        // this.currentArticleObj = null;
    }
    
    run = () => {
        return new Promise( 
            resolve => {
                console.log('HIHIHIHIHIHI')
                // let that = this;
                // if (window.location.search != null) {
                //     let uuid = this.State.Root.Services.Session.getParam('uuid');
                //     console.log('queryParam: ', uuid);

                //     that.editor = this.State.SubApp.Services.Editor.createEditor();

                //     this.State.SubApp.Services.Articles.getArticle(uuid).then( article_obj => {
                //         that.currentArticleObj = article_obj;
                //         that.loadEditor(that.currentArticleObj);
                //         document.getElementById('article_post_save_btn').addEventListener('click', function (){
                //             that.saveArticle();
                //         });
                //     });
                //     return resolve;
                // } else {
                //     console.log('UUID is not set as a param.')
                // }

                // document.getElementById('article_post_title').addEventListener('change', this.save);
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
    
    emptyTitleField = () => {
        let title_field = document.getElementById('article_post_title')
    }


    getCurrentArticlePayload = () => {
        let public = document.getElementById('article_public_switch').checked;
        if (public) {
            public.value = true;
        }
        let article_payload = {
            title: document.getElementById('article_post_title').value || this.State.Root.Memory.Articles.new.title, 
            content: this.editor.getContents(), 
            public: public,
            url: document.getElementById('article_post_url').value || this.State.Root.Memory.Articles.new.url,
            uuid: document.getElementById('article_post_uuid').value || this.State.Root.Memory.Articles.new.uuid,
            last_modified_at: this.State.Root.Memory.Articles.new.last_modified_at,
            published_at: this.State.Root.Memory.Articles.new.published_at
        };
        return article_payload;
    }

    saveArticle = () => {
        this.currentArticleObj.article.title = document.getElementById('article_post_title').value || this.currentArticleObj.article.title;
        this.currentArticleObj.article.content = this.editor.getContents() || this.currentArticleObj.article.content;
        let public = document.getElementById('article_public_switch');
        if (public) {
            this.currentArticleObj.article.public = true;
        }
        this.State.SubApp.Services.Articles.saveArticle(this.currentArticleObj).then( article_obj => {
            that.currentArticleObj = article_obj;
            that.loadEditor(that.currentArticleObj);
        });
    }

    loadEditor = (article_obj) => {
        document.getElementById('article_post_title').value = article_obj.article.title;
        this.editor.setContents(article_obj.article.content);
        let public = document.getElementById('article_public_switch');
        if (public) {
            document.getElementById('article_public_switch').value = article_obj.article.public;
        }
    }

    autoSave = () => {
        let article_payload = this.getCurrentArticlePayload()
        console.log('article_payload ', article_payload)
        this.currentArticleObj = article_payload;

        this.State.SubApp.Services.Articles.updateArticleInBackend(article_payload, function(response){
            document.getElementById('article_post_url').value = response.url;
            document.getElementById('article_post_uuid').value = response.uuid;
        });
    }

    
}
