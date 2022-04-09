export default class ArticleEdit {

    constructor(State){
        this.State = State
        this.resources = ["Editor"];
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
                
                that.editor = this.State.SubApp.Services.Editor.create();

                that.editor.on('text-change', function() {
                    console.log('Text change!');
                });
                
                
                if (window.location.search != null) {
                    let uuid = this.State.Root.Services.Session.getParam('uuid');
                    console.log('queryParam: ', uuid);
                    this.State.SubApp.Services.Articles.getArticle(uuid).then( article_obj => {
                        that.currentArticleObj = article_obj;
                        that.loadEditor(that.currentArticleObj);
                    });
                    document.getElementById('article_save_btn').addEventListener('click', function (){
                        that.saveArticle();
                    });

                    // alert(this.editor.getContents())

                    console.log(uuid);
                } else {
                    alert('There is no article UUID in the url.')
                }
                    
                // that.editor.onChange = function (contents, core) { 
                //     console.log('Contents.onChange: ', contents)
                //     that.currentArticleObj.article.content = contents;
                //     that.saveArticle();
                //  }
                    
                //  that.editor.onSave = function (contents, core) { 
                //     console.log('Contents.onSave: ', contents)
                //      that.currentArticleObj.article.content = contents;
                //      that.saveArticle();
                //   }
                document.getElementById('article_title').addEventListener('change', this.save);
                return resolve('Article.Edit Successful');
            },
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }

    saveArticle = () => {
        let that = this;
        this.currentArticleObj.article.title = document.getElementById('article_title').value || this.currentArticleObj.article.title;
        this.currentArticleObj.article.content = this.editor.getContents() || this.currentArticleObj.article.content;
        this.currentArticleObj.article.tags = document.getElementById('article_tags').value || this.currentArticleObj.article.tags || [];

        var isAutoSave = document.getElementById('article_autosave_switch').checked;
        if (isAutoSave) {
            document.getElementById('article_autosave_switch').checked = true;
            this.currentArticleObj.meta.auto_save = true;
        } else {
            document.getElementById('article_autosave_switch').checked = false;
            this.currentArticleObj.meta.auto_save = false;
        }

        var isPublic = document.getElementById('article_public_switch').checked;
        if (isPublic) {
            document.getElementById('article_public_switch').checked = true;
            this.currentArticleObj.meta.public = true;
        } else {
            document.getElementById('article_public_switch').checked = false;
            this.currentArticleObj.meta.public = false;
        }
        this.State.SubApp.Services.Articles.saveArticle(this.currentArticleObj).then( article_obj => {
            this.currentArticleObj = article_obj;
            this.loadEditor(this.currentArticleObj);
        });

        this.State.Root.Services.Component.toast('Article is saved.');
    }

    loadEditor = (article_obj) => {
        document.getElementById('article_title').value = article_obj.article.title;
        this.editor.setContents(article_obj.article.content);
        document.getElementById('article_public_switch').checked = article_obj.meta.public;
        document.getElementById('article_autosave_switch').checked = article_obj.meta.auto_save;
    }

}
