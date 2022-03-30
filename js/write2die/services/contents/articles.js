export class Articles {
    constructor(State) {
        this.State = State;
    }

    useAllArticles = (callback) => {
        return this.State.Root.Services.Data.API.Get(this.State.Root.Routes.API.articles_action, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
        });
    }

    postArticle = (article_payload, callback) => {
        return this.State.Root.Services.Data.API.Post(this.State.Root.Routes.API.articles_action + '?action=post', article_payload, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
        });
    }

    deleteArticle = (article_payload, callback) => {
        return this.State.Root.Services.Data.API.Post(this.State.Root.Routes.API.articles_action + '?action=delete', article_payload, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
        });
    }

    unpublishArticle = (article_payload, callback) => {
        return this.State.Root.Services.Data.API.Post(this.State.Root.Routes.API.articles_action + '?action=unpublish', article_payload, {}).then(
            response => {
                callback(response)
                return response;
            },
            reject => {
                return reject;
        });
    }

}