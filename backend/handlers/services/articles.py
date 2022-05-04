from random import randrange
import time
import uuid
import tornado
import json
import pymongo
from datetime import datetime
from handlers.base import BaseHandler
jsond = lambda x : json.dumps(x, indent=4)
def mongo2json(mongo_obj):
    mongo_obj_list = []
    for obj in mongo_obj:
        if '_id' in obj:
            del obj['_id']
        mongo_obj_list.append(obj)
    return jsond(mongo_obj_list)


class Articles(BaseHandler):
    def build_unique_url(self, title):
        url_friendly_title = '-'.join([
            title.lower().replace(' ', '-') or str(uuid.uuid4()),
            self.current_user['email'].split('@')[0],
            str(datetime.now().year),
            str(datetime.now().month),
            str(datetime.now().day),
            str(randrange(1000000))
        ])
        print(url_friendly_title)
        return url_friendly_title
    
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            
            if data.get('action') in ['view']:
                if 'uuid' in data.keys():
                    article = self.db.articles.find_one({'meta.owner': self.current_user.get('email'), 'meta.uuid': data.get('uuid')})
                    self.write_json(article)
                elif 'url' in data.keys():
                    article = self.db.articles.find_one({'meta.url': data.get('url')})
                    self.write_json(article)
                elif 'query' in data.keys():
                    if data['query'] in ['mine',]:
                        articles = self.db.articles.find({'meta.owner': self.current_user.get('email')})
                        self.write_json([article for article in articles])
                    
            elif data.get('action') in ['create',]:
                new_article = self.create_a_new_article_obj()
                self.db.articles.insert_one(new_article)
                self.write_json(new_article)
                    
            elif data.get('action') in ['update',]:
                print('Article.Action == update')
                article_obj_data = data['article']
                article_obj = self.db.articles.find_one({'meta.owner': self.current_user.get('email'), 'meta.uuid': article_obj_data['meta'].get('uuid')})
                article_obj['article']['title'] = article_obj_data['article'].get('title')
                article_obj['article']['description'] = article_obj_data['article'].get('description')
                article_obj['article']['content'] = article_obj_data['article'].get('content')
                article_obj['article']['tags'] = article_obj_data['article'].get('tags', []) or []
                
                article_obj['meta']['uuid'] = article_obj_data['meta'].get('uuid')
                article_obj['meta']['public'] = article_obj_data['meta'].get('public')
                article_obj['meta']['auto_save'] = article_obj_data['meta'].get('auto_save')
                article_obj['meta']['last_modified_at'] = article_obj_data['meta'].get('last_modified_at') or datetime.now()
                article_obj['meta']['url'] = article_obj_data['meta'].get('url') or self.build_unique_url(article_obj_data['article'].get('title'))
                if article_obj_data['meta'].get('public'):
                    article_obj['meta']['published_at'] = article_obj_data['meta'].get('published_at') or datetime.now()
                    
                self.db.articles.update_one({'meta.uuid': article_obj['meta']['uuid']}, {"$set": article_obj})
                self.write_json(article_obj)
                
            elif data.get('action') in ['delete',]:
                if 'uuid' in data.keys():
                    self.db.articles.delete_one({'meta.owner': self.current_user.get('email'), 'meta.uuid': data.get('uuid')})
                    self.write_json({'msg': 'Article deleted.'})

    
    @property
    def content_default(self):
        return '''
<h4>You can write your new article here.</h4>
<ul>
    <li>Publish your article by clicking on the toggle for public.</li>
    <li>Autosave button will automatically save all your changes in the background.</li>
    <li>Find & Edit all of the articles on <a href="/contents/articles/edit/"></a></li>
</ul>
'''

    def create_a_new_article_obj(self):
        return {
            'meta': {
                'uuid': str(uuid.uuid4()), 
                'url': '',
                'public': False,
                'auto_save': True,
                'owner': self.current_user.get('email'),
                'last_modified_at': datetime.now(),
                'created_at': datetime.now(),
                'published_at': None
            },
            'article': {
                'title': '',
                'description': '',
                'content': self.content_default,
                'tags': []
            },
            'analytics': {
                'view_counts': 0,
                'upvote_counts': 0,
                'avg_seconds_spent_reading': 0,
                'word_count': 0
            }
        }