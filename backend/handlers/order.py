import json
from uuid import uuid4
import tornado
from handlers.base import BaseHandler
from config import db

class StockOrder:
    def __init__(self, order_data) -> None:
        self.action = order_data['action']
        self.isin = order_data['isin']
        self.qty = order_data['qty']
        self.price = order_data['price']
        self.currency = order_data['currency']
        self.locked = order_data['locked']
        self.ts_submitted = order_data['ts_submitted']
        self.status = order_data['status']
        self.order_id = order_data['uuid']
        self.email = order_data['email']
        self.db = db
    
    def process(self):
        credit = self.db.users.find_one({'email': self.email})


class Credit(BaseHandler):
    def get(self):
        if self.current_user:
            user = self.db.users.find_one({'email': self.current_user.get('email')})
            self.write(json.dumps({
                'owner': {
                    'fullname': user.get('fullname'),
                    'account_id': user.get('uuid'),
                    'status': user.get('account_status'),
                    'created': user.get('created_at'),
                },
                'credit': user.get('credit')
            }))
        else:
            self.write_error(401, {'reason': 'Authentication failed.'})


class Order(BaseHandler):
    def post(self):
        order_data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            order = {
                'action': order_data['action'],
                'isin': order_data['isin'],
                'qty': order_data['qty'],
                'price': order_data['price'],
                'currency': order_data['currency'],
                'locked': order_data['locked'],
                'ts_submitted': order_data['ts_submitted'],
                'status': 'submitted',
                'order_id': str(uuid4()),
                'email': self.current_user['email']
            }
            self.db.orders.insert_one(order)
            stock_order = StockOrder(order)
            stock_order.process()
        else:
            self.write_error(401, {'reason': 'Authentication failed.'})

    def get(self):
        if self.current_user:
            orders = self.db.orders.find({'email': self.current_user.get('email')})
            payload = {}
            for order in orders:
                del order['_id']
                payload[order['order_id']] = order
            self.write(json.dumps(payload))
        else:
            self.write_error(401, {'reason': 'Authentication failed.'})