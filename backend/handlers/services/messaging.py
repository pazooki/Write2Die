import tornado
import json
from uuid import uuid4
from time import time
from handlers.base import BaseHandler
import logging
logger = logging.getLogger('Tajiran')
logger.setLevel(logging.INFO)


class Notification(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            notifications = self.db.notifications.find_one({'email': self.current_user.get('email')})
            if notifications is not None and '_id' in notifications:
                del notifications['_id']
            else:
                notifications = dict(email=self.current_user.get('email'), notifications=[])
            if data.get('id') in [n.get('id') for n in notifications['notifications']] and data.get('status') in ['read']:
                self.db.notifications.update_one({'email': self.current_user.get('email'), 'notifications.id': data.get('id')}, {'$set': data})
            else:
                notif = {
                    'id': str(uuid4()),
                    'status': data.get('status'),
                    'head': data.get('head'),
                    'msg': data.get('msg'),
                    'created_at': int(time() * 1000),
                    'updated_at': int(time() * 1000)
                }
                notifications['notifications'].append(notif)
                self.db.notifications.update_one({'email': self.current_user.get('email')}, {'$set': notifications}, upsert=True)
            del notifications['email']
            self.write(json.dumps(notifications['notifications']))
    
    def get(self):
        if self.current_user:
            notifications = self.db.notifications.find_one({'email': self.current_user.get('email')}) or {}
            self.write(json.dumps(notifications.get('notifications', [])))


class Chat(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        logger.info(data)
        if self.current_user:
            chat = self.db.chat.find_one({'email': self.current_user.get('email')})
            if not chat:
                chat = dict()
            else:
                del chat['_id']
                del chat['email']
            updated_chat = dict()
            if 'status' in data and data.get('status') == 'read' and data.get('msg') is None: # Mark As Read Indicated by User/Event
                for ts, msg_obj in chat.items():
                    if msg_obj.get('id') == data.get('id'):
                        updated_chat[ts] = msg_obj
                        updated_chat[ts]['status'] = 'read'
                chat.update(updated_chat)
                self.db.chat.update_one({'email': self.current_user.get('email')}, {'$set': chat}, upsert=True)
                
                self.write(json.dumps(chat))
            else:
                msg_obj = dict()
                for ts, value in data.items():
                    msg_obj[ts] = value
                    msg_obj[ts]['from'] = self.current_user.get('email')
                    msg_obj[ts]['id'] = str(uuid4())
                    msg_obj[ts]['status'] = 'unread'
                    chat.update(msg_obj)
                self.db.chat.update_one({'email': self.current_user.get('email')}, {'$set': chat}, upsert=True)
                self.write(json.dumps(chat))
    
    def get(self):
        if self.current_user:
            chat = self.db.chat.find_one({'email': self.current_user.get('email')})
            if not chat:
                chat = dict()
            else:
                del chat['_id']
                del chat['email']
            updated_chat = dict()
            for ts, msg_obj in chat.items(): # Mark the messages that belongs to the user as read
                if self.current_user.get('email') == msg_obj.get('from'):
                    updated_chat[ts] = msg_obj
                    updated_chat[ts]['status'] = 'hide'
            chat.update(updated_chat)
            self.write(json.dumps(chat))