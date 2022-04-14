
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        console.log('debounce')
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

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
    }

    run = () => {
        return new Promise(
            resolve => {
                let that = this;

                let debouncedSaveArticle = debounce(that.saveArticle, 300);

                that.editor = this.State.SubApp.Services.Editor.create('#editor');

                if (window.location.search != null) {
                    let uuid = this.State.Root.Services.Session.getParam('uuid');
                    console.log('queryParam: ', uuid);
                    this.State.SubApp.Services.Articles.getArticle(uuid).then(article_obj => {
                        that.currentArticleObj = article_obj;
                        that.loadEditor(that.currentArticleObj);
                        console.log(that.currentArticleObj);

                        if (that.currentArticleObj.meta.auto_save) {
                            that.editor.on('summernote.change', function (we, contents, $editable) {
                                debouncedSaveArticle()
                            });
                        }
                    });
                    document.getElementById('article_save_btn').addEventListener('click', function () {
                        debouncedSaveArticle()
                    });

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
        console.log('saveArticle.')
        let that = this;
        that.currentArticleObj.article.title = document.getElementById('article_title').value;
        that.currentArticleObj.article.content = that.editor.summernote('code');
        that.currentArticleObj.article.tags = document.getElementById('article_tags').value || [];

        var isAutoSave = document.getElementById('article_autosave_switch').checked;
        if (isAutoSave) {
            document.getElementById('article_autosave_switch').checked = true;
            that.currentArticleObj.meta.auto_save = true;
        } else {
            document.getElementById('article_autosave_switch').checked = false;
            that.currentArticleObj.meta.auto_save = false;
        }

        var isPublic = document.getElementById('article_public_switch').checked;
        if (isPublic) {
            document.getElementById('article_public_switch').checked = true;
            that.currentArticleObj.meta.public = true;
        } else {
            document.getElementById('article_public_switch').checked = false;
            that.currentArticleObj.meta.public = false;
        }

        console.log('Saving Article Obj: ', that.currentArticleObj)

        that.State.SubApp.Services.Articles.saveArticle(that.currentArticleObj).then(article_obj => {
            that.currentArticleObj = article_obj;
            that.loadEditor(that.currentArticleObj);
        });

        that.State.Root.Services.Component.toast('Article is saved.');
    }

    loadEditor = (article_obj) => {
        document.getElementById('article_title').value = article_obj.article.title;
        this.editor.summernote('code', article_obj.article.content);
        document.getElementById('article_public_switch').checked = article_obj.meta.public;
        document.getElementById('article_autosave_switch').checked = article_obj.meta.auto_save;
    }

}

