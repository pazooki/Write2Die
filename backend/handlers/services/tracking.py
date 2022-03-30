
import tornado
import json
from uuid import uuid4
from time import time
from handlers.base import BaseHandler

class Tracking(BaseHandler): 
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            data['user'] = self.current_user.get('email')
        else:
            data['user'] = 'anonymous'
        data['ip_address'] = self.request.remote_ip
        data['received_ts'] = int(time() * 1000)
        self.db.tracking.insert_one(data)
        
    def get(self):
        tracking = self.db.tracking.find().sort("ts", -1).limit(50)
        jtracking = []
        for track in tracking:
            del track['_id']
            jtracking.append(track)
        self.write(json.dumps(jtracking, indent=4, ensure_ascii=False))