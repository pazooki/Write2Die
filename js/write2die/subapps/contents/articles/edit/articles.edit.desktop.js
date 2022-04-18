
export default class ArticleEdit {

    constructor(State) {
        this.State = State
        this.resources = ["Editor"];
        this.title = this.State.Root.Services.Localization.i18n('Title')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Description Tags'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','));
        this.currentArticleObj = null;
        this.last_save_ts = Date.now();
        this.autosave_threshold = 5000;
    }

    is_ready_for_autosave = () => {
        console.log((Date.now() - this.last_save_ts), this.autosave_threshold);
        if ((Date.now() - this.last_save_ts) >= this.autosave_threshold) {
            return true;
        } else {
            return false;
        }
    }

    save = () => {
        // $('#editor').summernote('editor.saveRange');

        if (this.is_ready_for_autosave()) {
            this.saveArticle()
            this.last_save_ts = Date.now();
        }
    }

    run = () => {
        return new Promise(
            resolve => {
                let that = this;
                that.editor = this.State.SubApp.Services.Editor.create('#editor');

                if (window.location.search == null) {
                    alert('There is no article UUID in the url.')
                } else {
                    let uuid = this.State.Root.Services.Session.getParam('uuid');
                    console.log('queryParam: ', uuid);
                    this.State.SubApp.Services.Articles.getArticle(uuid).then(article_obj => {
                        that.currentArticleObj = article_obj;
                        that.loadEditor(that.currentArticleObj);
                        if (that.currentArticleObj.meta.auto_save) {
                            that.editor.on('summernote.change', function (we, contents, $editable) {
                                console.log('AutoSave Is On...');
                                that.save();
                            });
                        }
                    });
                    document.getElementById('article_save_btn').addEventListener('click', that.save);

                    that.editor.on('summernote.image.upload', function(we, files) {
                        // upload image to server and create imgNode...
                        console.log('editor.image.upload', we, files);
                        that.editor.summernote('insertNode', imgNode);
                    });
                      
                      
                }
                document.getElementById('article_title').addEventListener('change', that.save);
                document.getElementById('article_description').addEventListener('change', that.save);
                return resolve('Article.Edit Successful');
            },
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }

    saveArticle = () => {
        console.log('saveArticle.')
        let that = this;
        that.currentArticleObj.article.title = document.getElementById('article_title').value;
        that.currentArticleObj.article.description = document.getElementById('article_description').value;
        that.currentArticleObj.article.content = that.editor.summernote('code');
        that.currentArticleObj.article.tags = document.getElementById('article_tags').value || [];

        let autoSaveElement = document.getElementById('article_autosave_switch');
        var isAutoSave = autoSaveElement.checked;
        if (isAutoSave) {
            autoSaveElement.checked = true;
            that.currentArticleObj.meta.auto_save = true;
        } else {
            autoSaveElement.checked = false;
            that.currentArticleObj.meta.auto_save = false;
        }

        let publicElement = document.getElementById('article_public_switch')
        var isPublic = publicElement.checked;
        if (isPublic) {
            publicElement.checked = true;
            that.currentArticleObj.meta.public = true;
        } else {
            publicElement.checked = false;
            that.currentArticleObj.meta.public = false;
        }

        console.log('Saving Article Obj: ', that.currentArticleObj)

        that.State.SubApp.Services.Articles.saveArticle(that.currentArticleObj).then(article_obj => {
            that.currentArticleObj = article_obj;
        });

        that.State.Root.Services.Component.toast('Article is saved.');
        that.last_saved = Date.now();
    }

    loadEditor = (article_obj) => {
        document.getElementById('article_title').value = article_obj.article.title;
        document.getElementById('article_description').value = article_obj.article.description;
        this.editor.summernote('code', article_obj.article.content);
        document.getElementById('article_public_switch').checked = article_obj.meta.public;
        document.getElementById('article_autosave_switch').checked = article_obj.meta.auto_save;


        document.getElementById('article_tags').value = this.currentArticleObj.article.tags;

        let public_url_element = document.getElementById('article_public_url')
        let abs_public_url = 'http://localhost/contents/articles/view/?article=';
        if (article_obj.meta.public){
            public_url_element.style.visibility = 'visible';
            document.getElementById('top_bar_text').style.visibility = 'visible';
            public_url_element.href = abs_public_url + article_obj.meta.url;
            public_url_element.innerText = article_obj.article.title;
        } else {
            public_url_element.style.visibility = 'hidden';
            document.getElementById('top_bar_text').style.visibility = 'hidden';
        }

    }

}

