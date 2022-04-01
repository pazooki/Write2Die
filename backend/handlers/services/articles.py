import uuid
import tornado
import json
import pymongo
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
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        all_articles = self.db.articles.find({}).limit(100)
        if self.current_user:
            if data.get('action') in ['GET',]:
                if data.get('query') is None or data.get('query') in ['', 'all']:
                    self.write(mongo2json(all_articles))
                elif data.get('query') in ['live']:
                    new_articles = self.db.articles.find({}).sort('published_at',pymongo.DESCENDING).limit(100)
                    self.write(mongo2json(new_articles))
                elif data.get('query') in ['today_top']:
                    today_top_articles = self.db.articles.find({}).sort('views',pymongo.DESCENDING).limit(100)
                    self.write(mongo2json(today_top_articles))
                elif data.get('query') in ['top_100_global']:
                    top_100_global = self.db.articles.find({}).sort('views',pymongo.DESCENDING).limit(100)
                    self.write(mongo2json(top_100_global))
                else:
                    articles_subset = self.db.articles.find({'uuid': data.get('query')})
                    self.write(mongo2json(articles_subset))
                    
            elif data.get('action') in ['POST',]:
                self.db.articles.insert_one({
                    'uuid': str(uuid.uuid4()), 
                    'title': data.get('title'),
                    'short_desc': data.get('short_desc'),
                    'published_at': data.get('published_at'),
                    'title': data.get('title'),
                    'title': data.get('title'),
                })
            elif data.get('action') in ['DELETE',]:
                pass
            elif data.get('action') in ['UNPUBLISH']:
                pass
            elif data.get('action') in ['UPDATE']:
                pass
        else:
            if data.get('action') in ['GET',]:
                articles = mongo2json(self.db.articles.find({}))
                self.write(json.dumps({'msg': 'You are not signed in', 'user': {'uuid': None}}))
                
                
                if data.get('action') in ['out']:
                    user_found = self.db.users.find_one({'email': self.current_user.get('email')})
                    user_found['status'] = 'out'
                    del user_found['_id']
                    self.db.users.update_one({'email': user_found.get('email')}, {'$set': user_found}, upsert=False)
                    self.write(json.dumps(user_found))
                if data.get('action') in ['in']:
                    self.write(json.dumps(self.current_user))
                if data.get('action') in ['update']:
                    user_found = self.db.users.find_one({'email': self.current_user.get('email')})
                    del user_found['_id']
                    user_found.update(data)
                    self.db.users.update_one({'email': user_found.get('email')}, {'$set': user_found}, upsert=False)
                    self.write(json.dumps(user_found))