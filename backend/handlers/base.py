import json
import tornado.web
import traceback
from uuid import uuid4
from config import log
import pyhash

class Authentication:
    def __init__(self, data):
        self.user_id = data.get('uuid', None)

    def is_signed_in(self):
        if self.user_id:
            return json.dumps({'msg': 'client already have uuid.', 'user': {'uuid': self.user_id}})
        else:
            return {}

    def sign_in(self):
        user_id = str(uuid4())
        self.db.users.update_one({'uuid': user_id}, {'$set': {'uuid': user_id}}, upsert=True)
        self.set_cookie("uuid", user_id, expires_days=365)
        payload = json.dumps({'msg': 'new uuid set.', 'user': {'uuid': user_id}})
        return payload

    def authed(self):
        if self.user_id:
            return True
        else:
            return False


class BaseHandler(tornado.web.RequestHandler):
    SUPPORTED_METHODS = ("CONNECT", "GET", "HEAD", "POST", "DELETE", "PATCH", "PUT", "OPTIONS")

    def connect(self):
        pass

    def initialize(self, db):
        self.db = db
        self.user = None
        # self.auth = Authentication(tornado.escape.json_decode(self.request.body or {}))
        # self.q = q

    def set_default_headers(self):
        # self.set_header("X-Forwarded-Proto", "originatingProtocol")
        self.set_header("Access-Control-Allow-Credentials", "true")
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "Authorization, Accept, Content-Type, Origin, Depth, "
                                                        "User-Agent, X-File-Size, X-Requested-With, X-Requested-By, "
                                                        "If-Modified-Since, X-File-Name, Cache-Control")
        self.set_header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE,PATCH')
        self.set_header('Content-type', 'application/json')

    def options(self):
        self.set_status(204)
        self.finish()

    def is_authed(self):
        return self.auth.authed()

    def get_current_user(self):
        uuid = self.request.headers.get('Authorization')
        self.current_user = self.db.users.find_one({'uuid': uuid})
        if self.current_user is not None and type(self.current_user) is dict and '_id' in self.current_user:
            del self.current_user['_id']
        log.info(json.dumps({'uuid': uuid, 'user': self.current_user}))
        return self.current_user
        
    def options(self):
        # no body
        self.set_status(204)
        self.finish()
        
    def hash(self, key):
        h = pyhash.murmur3_32(1)
        return h(json.dumps(key).encode('ascii')[1:-1])
        
    def write_error(self, status_code, **kwargs) -> None:
        if self.settings.get("serve_traceback") and "exc_info" in kwargs:
            # in debug mode, try to send a traceback
            self.set_header('Content-Type', 'text/plain')
            for line in traceback.format_exception(*kwargs.get("exc_info")):
                self.write(line)
            self.finish()
        else:
            self.set_status(status_code)
            if kwargs.get('reason'):
                self.finish(kwargs.get('reason'))
            else: 
                self.finish("<html><title>%(code)d: %(message)s</title>"
                    "<body>%(code)d: %(message)s</body></html>" % {
                        "code": status_code,
                        "message": self._reason,
                    })
                
    def write_json(self, payload_dict):
        self.write(json.dumps(payload_dict, indent=4, sort_keys=True, default=str))
        
        
def hash(key):
    h = pyhash.murmur3_32(1)
    return h(json.dumps(key).encode('ascii')[1:-1])