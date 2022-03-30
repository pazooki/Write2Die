from config import log, STATIC_LEGALS_PATH
import json
import base64
import os
import tornado
from bson import json_util
from handlers.base import BaseHandler
import tornado
import json
from uuid import uuid4
from time import time
from handlers.base import BaseHandler


class Signup(BaseHandler):
    def post(self):
        try:
            data = tornado.escape.json_decode(self.request.body) or {}
        except Exception as ex:
            self.write({'msg': 'Sign up failed.'})
        else:
            user_found = self.db.users.find_one({'email': data.get('email')})
            if user_found:
                self.write_error(422, {'reason': 'This email %s is already registered.' % data.get('email')})
            else:
                user = {
                    'fullname': data.get('fullname'),
                    'email': data.get('email'),
                    'password': data.get('password'),
                    'uuid': str(uuid4()),
                    'status': 'in',
                    'created_at': int(time() * 1000),
                    'last_seen': int(time() * 1000)
                }
                self.db.users.update_one({'email': user.get('email')}, {'$set': user}, upsert=True)
                self.write(json.dumps(user))

class Auth(BaseHandler):
    def post(self):
        log.info('Auth....')
        data = tornado.escape.json_decode(self.request.body) or {}
        log.info('Auth Request')
        log.info(data)
        try:
            user = self.db.users.find_one({'email': data.get('email')})
            if user and '_id' in user.keys():
                del user['_id']
            else:
                raise Exception('There is no user registered with this email.')
        except Exception as ex:
            self.write_error(401, **{'reason': 'Sign in failed', 'input_data': data, 'exception': str(ex)})
        else:
            if user.get('password') == data.get('password'):
                user['status'] = 'in'
                user['last_seen'] = int(time() * 1000)
                self.set_secure_cookie('uuid', str(user.get('uuid')))
                self.db.users.update_one({'email': data.get('email')}, {'$set': user}, upsert=False)
                self.write(json.dumps(user))


class User(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
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
        else:
            self.write(json.dumps({'msg': 'You are not signed in', 'user': {'uuid': None}}))

    def get(self):
        log.info(json.dumps(self.request.headers.__dict__))
        if self.current_user:
            user = self.db.users.find_one({'email': self.current_user.get('email')})
            del user['_id']
            log.info(json.dumps(user))
            self.write(json.dumps(user))
        else:
            log.info(json.dumps(self.current_user))
            self.write(json.dumps({'reason': self.request.headers.get('Authorization')}))
            

class UserAddress(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            user = self.db.users.find_one({'email': self.current_user.get('email')})
            if user.get('_id'):
                del user['_id']
            if data.get('action') in ['post']:
                user['address'] = data.get('data')
                self.db.users.update_one({'email': user.get('email')}, {'$set': user}, upsert=False)
                self.write(user)
            elif data.get('action') in ['get']:
                self.write(user)
        else:
            self.write(json.dumps({'msg': 'You are not signed in', 'user': {'uuid': None}}))
            

class ProfileGovIDUploadFile(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            if data.get('action') in ['post']:
                response = {'status': {}, 'msg': ''}
                for fname, based64d in data.get('files').items():
                    payload = {
                        'email': self.current_user.get('email'),
                        'ts': int(time() * 1000),
                        'name': fname,
                        'status': 'Under Review',
                        'comment': 'N/A',
                        'file': {
                            'memtype': based64d.split('base64,')[0],
                            'data': base64.decodebytes(based64d.split('base64,')[1].encode('utf-8')),
                        }
                    }
                    self.db.legals.insert_one(payload)
                response['msg'] = str(len(data.get('files'))) + ' Files Uploaded Successfully.'
                self.write(response)
            elif data.get('action') in ['get']:
                response = {'status': False, 'files': []}
                try:
                    legal_documents = self.db.legals.find({'email': self.current_user.get('email')})
                    status = set()
                    for doc in legal_documents:
                        del doc['_id']
                        doc['file']['data'] = base64.b64encode(doc.get('file').get('data')).decode('ascii')
                        response['files'].append(doc)
                        status.add(doc.get('status'))
                    if 'Under Review' in status:
                        response['status'] = 'Under Review'
                    elif 'Under Review' not in status and 'Rejected' not in status and 'Approved' in status:
                        response['status'] = 'Approved'
                    elif 'Rejected' in status:
                        response['status'] = 'Rejected'
                    elif len(status) == 0:
                        response['status'] = 'Incomplete'
                    self.write(response)
                except Exception as ex:
                    print(ex)
                    response['status'] = False
                    self.write(response)
        else:
            self.write(json.dumps({'msg': 'You are not signed in', 'user': {'uuid': None}}))

class ContractAPI(BaseHandler):
    @tornado.web.authenticated
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        if self.current_user:
            if data.get('action') in ['post']:
                self.db.contracts.update_one({'email': self.current_user.get('email')}, {'$set': data}, upsert=True)
                self.write({'status': True})
            elif data.get('action') in ['get']:
                agreement_f = open(os.path.join(STATIC_LEGALS_PATH, 'legal_contract.txt'), 'r')
                agreement = agreement_f.readlines()
                contract = {
                    'ts': int(time()*1000),
                    'contract': agreement,
                    'fullname': 'firstname lastname',
                    'checked': False,
                    'status': True,
                    'msg': 'Failed to load the contract.'
                }
                try:
                    db_contract = self.db.contract_templates.find_one({'id': 1})
                    if db_contract:
                        del db_contract['_id']
                    db_contract['ts'] = int(time()*1000)
                    db_contract['fullname'] = self.current_user.get('fullname')
                    self.write(db_contract)
                except Exception as ex:
                    db_contract = None
                self.write(db_contract if db_contract else contract)
        else:
            self.write(json.dumps({'msg': 'You are not signed in', 'user': {'uuid': None}}))
