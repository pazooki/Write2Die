
import tornado
import json
from uuid import uuid4
from time import time
from handlers.base import BaseHandler

class Subscription(BaseHandler): 
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        '''
            {
                'uuid': {
                    'type': 'symbol-profile' | 'symbol-data' | 'symbol-documents' | 'order' | 'user-profile',
                    'target_id': 'symbol-isin' | 'order-id' | 'user-id',
                    'status': 'active' | 'done'
                    'updated_at': 'ts',
                    'created_at': 'ts'
                }
            }
        '''
        if self.current_user:
            subscriptions = self.db.subscriptions.find_one({'email': self.current_user.get('email')})
            if not subscriptions:
                subscriptions = dict(email=self.current_user.get('email'), subscriptions=[])
            
            if data.get('id') in [n.get('id') for n in subscriptions['subscriptions']] and data.get('status') in ['done']:
                self.db.subscriptions.update_one({'email': self.current_user.get('email'), 'subscriptions.id': data.get('id')}, {'$set': {'status': data.get('status')}})
            else:
                new_sub = {
                    'id': str(uuid4()),
                    'type': data.get('type'),
                    'updated_at': int(time() * 1000),
                    'created_at': int(time() * 1000),
                    'status': data.get('status'),
                    'target_id': data.get('target_id'),
                }
                subscriptions['subscriptions'].append(new_sub)
                self.db.subscriptions.update_one({'email': self.current_user.get('email')}, {'$set': subscriptions}, upsert=True)
            self.write(json.dumps(subscriptions['subscriptions']));


    def get(self):
        if self.current_user:
            if self.get_arguments('target_id'):
                target_id = self.get_query_argument('target_id')
                subscriptions = self.db.subscriptions.find_one({'email': self.current_user.get('email'), 'subscriptions.target_id': target_id})
            else:
                subscriptions = self.db.subscriptions.find_one({'email': self.current_user.get('email')})
                
            if subscriptions:
                self.write(json.dumps(subscriptions['subscriptions']))
            else:
                self.write(json.dumps([]))