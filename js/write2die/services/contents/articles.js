export class Articles {
    constructor(State) {
        this.State = State;
    }

    requestToCreateANewArticle = () => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.articles_action,  {'action': 'create'}, {});
    }

    saveArticle = (article_obj) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.articles_action,  {'action': 'update', 'article': article_obj}, {});
    }


    getArticle = (uuid) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.articles_action,  {'action': 'get', 'uuid': uuid}, {});
    }


    getArticleByUrl = (url, callback) => {
        return this.State.Root.Services.Data.API.Post(
            this.State.Routes.API.articles_action, 
            {'query': 'filtered', 'url': url, 'action': 'view'}, {}
        )
    }

    getUserArticlesSortedByTime = (callback) => {
        return this.State.Root.Services.Data.API.Post(
                this.State.Routes.API.articles_action, 
                {'query': 'all', 'action': 'view'}, {}
            ).then(
            response => {
                return callback(response);
            },
            reject => {
                console.log('Failed to getLatestDraftArticle.');
                return reject;
            }
        );
    }

    useAllArticles = (callback) => {
        return this.State.Root.Services.Data.API.Get(this.State.Routes.API.articles_action, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
            });
    }

    postArticle = (article_payload, callback) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.articles_action, article_payload, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
            });
    }

    deleteArticle = (article_payload, callback) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.articles_action + '?action=delete', article_payload, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
            });
    }

    unpublishArticle = (article_payload, callback) => {
        return this.State.Root.Services.Data.API.Post(this.State.Routes.API.articles_action + '?action=unpublish', article_payload, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
            });
    }

}