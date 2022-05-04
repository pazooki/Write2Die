
export default class ArticlesMine {
    constructor(State){
        this.State = State
        this.resources = [];
        this.title = this.State.Root.Services.Localization.i18n('Title')
        this.descriptoin = this.State.Root.Services.Localization.i18n([
            'Description Tags'
        ].concat(' '))
        this.keywords = this.State.Root.Services.Localization.i18n(this.descriptoin.split(' ').concat(','))
    }
    
    run = () => {
        return new Promise( 
            resolve => {
                let that = this;

                this.State.Root.Services.Data.API.Post(
                    this.State.Routes.API.articles_action, {'query': 'mine', 'action': 'view'}, {}
                ).then(
                    response => {
                        console.log('My Articles', response);
                        let card_group = document.getElementById('my_articles_list')
                        for (let article_obj of response) {
                            let actionGroup = document.createElement('div');

                            if (article_obj.meta.public) {
                                let viewBtn = this.State.Root.Services.Component.a(
                                    this.State.Routes.SubApps["articles.view"].route + article_obj.meta.url, 
                                    'View', 
                                    {}, 
                                    ['btn', 'btn-sm', 'btn-success']
                                );
    
                                actionGroup.appendChild(viewBtn);
                            }

                            let editBtn = this.State.Root.Services.Component.a(
                                this.State.Routes.SubApps["articles.edit"].route + article_obj.meta.url, 
                                'Edit', 
                                {}, 
                                ['btn', 'btn-sm', 'btn-primary']
                            );
                            actionGroup.appendChild(editBtn);

                            let card = this.State.Root.Services.Component.create_card(
                                null, 
                                article_obj.article.title, 
                                'Written on ' + article_obj.meta.created_at.split(' ')[0],
                                article_obj.article.description,
                                actionGroup
                            )
                            card.classList.add('w-50');
                            card_group.appendChild(card);
                        }
                    },
                    reject => {
                        console.log('My Articles reject: ', reject);
                    }
                );
                return resolve('This is a template subapp script');
            }, 
            reject => {
                return reject(new Error('Failed to load'));
            }
        );
    }
}
