
import tornado
import json
from time import time
from handlers.base import BaseHandler

class LogBack(BaseHandler): 
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            data['user'] = self.current_user.get('email')
        else:
            data['user'] = 'anonymous'
        data['ip_address'] = self.request.remote_ip
        data['received_ts'] = int(time() * 1000)
        self.db.logback.insert_one(data)
        
    def get(self):
        logs = self.db.logback.find().sort("ts", -1).limit(5)
        jlogs = []
        for log in logs:
            del log['_id']
            jlogs.append(log)
        self.write(json.dumps(jlogs))