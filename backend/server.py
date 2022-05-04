import time
from handlers.base import BaseHandler
import json
import tornado.options
import tornado.web
from config import setup_logger
import logging
import os
setup_logger('Axiom7.server', os.path.join('/home/mehrdadpazooki/', 'Axiom7.server.log'))
log = logging.getLogger('Axiom7.server')

from config import db, tornado_settings

from handlers.headers import ClientHeaders
from handlers.order import Credit, Order
from handlers.services.subscription import Subscription
from handlers.services.messaging import Notification, Chat
# from handlers.services.localization import Localization, LocalizationUpdate, CacheHandler
from handlers.services.tracking import Tracking
from handlers.services.logback import LogBack
from handlers.services.articles import Articles
from handlers.services.user import Auth, Signup, User, ProfileGovIDUploadFile, UserAddress, ContractAPI

class Ping(BaseHandler):
    def get(self):
        ping_ts = self.get_argument('ping_ts', None)
        self.write(json.dumps({'ping': ping_ts, 'pong': int(time.time() * 1000)}))
        
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        ping_ts = data.get('ping_ts')
        self.write(json.dumps({'ping': ping_ts, 'pong': int(time.time() * 1000)}))

class Health(BaseHandler):
    def get(self):
        import_report = self.db.imported.report.find_one({'key': 'latest_import'}) or {}
        if import_report and '_id' in import_report:
            del import_report['_id']
        payload = {
            'mongo': {
                'counts': {c: db[c].count_documents({}) for c in db.list_collection_names()},
            },
            'data': {},
            'settings': tornado_settings
        }
        if len(import_report.keys()) > 0:
            payload['data'] = {
                'import_report': {'date': import_report.get('date').strftime("%Y-%m-%d %H:%M:%S"), 'report': import_report.get('report')}
            }
        self.write(json.dumps(payload, indent=4))


routing = [
    ### On Nginx all paths will start by /api/*
    
    (r"/services/health/", Health, {'db': db}),
    (r"/services/ping", Ping, {'db': db}),
    (r"/services/ping(.*)", Ping, {'db': db}),
    
    # Services
    
    # (r"/services/cache", CacheHandler, {'db': db}),
    # (r"/services/localization/update/(.*)", LocalizationUpdate, {'db': db}),
    # (r"/services/localization/update", LocalizationUpdate, {'db': db}),
    # (r"/services/localization", Localization, {'db': db}),
    (r"/services/tracking", Tracking, {'db': db}),
    (r"/services/logback", LogBack, {'db': db}),
    (r"/services/headers/", ClientHeaders, {'db': db}),
    (r"/services/subscription/", Subscription, {'db': db}),
    (r"/services/messaging/notification", Notification, {'db': db}),
    (r"/services/messaging/chat", Chat, {'db': db}),

    # User
    (r"/auth/", Auth, {'db': db}),
    (r"/signup/", Signup, {'db': db}),
    (r"/user/", User, {'db': db}),
    (r"/content/articles/", Articles, {'db': db}),
    
    
    
    # My Portfolio
    (r"/user/order/", Order, {'db': db}),
    (r"/user/credit/", Credit, {'db': db}),


    # Static
    (r"/icons/(.*)", tornado.web.StaticFileHandler, {"path": tornado_settings['static_path']}),
]

# For GUNICORN
# axiom7_app = tornado.web.Application(
#     routing, 
#     tornado_settings, 
#     # login_url=tornado_settings.get('login_url'),
#     cookie_secret=tornado_settings.get('COOKIE_SECRET'), 
#     COOKIE_SECRET=tornado_settings.get('COOKIE_SECRET')
# )


def axiom7_app():
    return tornado.web.Application(
        routing,
        tornado_settings,
        cookie_secret=tornado_settings.get('COOKIE_SECRET'), 
        COOKIE_SECRET=tornado_settings.get('COOKIE_SECRET')
    )

if __name__ == "__main__":
    app = axiom7_app()
    app.listen(8181)
    tornado.ioloop.IOLoop.current().start()