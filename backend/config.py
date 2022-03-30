import logging
import os
import base64
import uuid
from pymongo import MongoClient
try:
    from elasticsearch import Elasticsearch
    es_cli = Elasticsearch(['http://localhost:9200'])
except Exception:
    print('no elasticsearch module found.')


def setup_logger(logger_name, log_file, level=logging.INFO):
    l = logging.getLogger(logger_name)
    formatter = logging.Formatter('%(asctime)s : %(message)s')
    fileHandler = logging.FileHandler(log_file, mode='w')
    fileHandler.setFormatter(formatter)
    streamHandler = logging.StreamHandler()
    streamHandler.setFormatter(formatter)
    l.setLevel(level)
    l.addHandler(fileHandler)
    l.addHandler(streamHandler)


PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))
FRONTEND_ROOT = os.path.dirname(os.path.abspath(os.path.join(PROJECT_ROOT, '..', 'frontend')))
DATA_PATH = os.path.abspath(os.path.join('/home/mehrdadpazooki/', 'data/'))
SITE_ROOT = os.path.join(PROJECT_ROOT, '../frontend')
COMPANIES_NAME_PATH = os.path.join(PROJECT_ROOT, 'libs/tse/data/symbols_name.json')

STATIC_FILES_PATH = os.path.abspath(os.path.join(PROJECT_ROOT, 'static_files'))
STATIC_LEGALS_PATH = os.path.abspath(os.path.join(PROJECT_ROOT, 'static_files', 'legals'))

COOKIE_SECRET = base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes).decode('utf8')

tornado_settings = {
    "static_path": os.path.abspath(os.path.join(FRONTEND_ROOT, 'static')),
    "static_url_prefix": "/static/",
    "COOKIE_SECRET": COOKIE_SECRET,
    "cookie_secret": COOKIE_SECRET,
    # 'login_url': '/api/auth',
    "gzip" : True,
    'debug': True,
    "serve_traceback": True
}

logging.basicConfig(filename=os.path.join('/home/mehrdadpazooki/', 'write2die-tornado.log'), level=logging.INFO)
log = logging

mongo_cli = MongoClient('mongodb://localhost')
db = mongo_cli.write2die

def setup():
    fields = [
        "isin", "CISIN", "ISIN", "company", "company_name", "company_name_en",
        "industry", "symbol", "symbol_en", "table_name", "tableau", "tse_symbol"
    ]
    fields = [(i, 'text') for i in fields]
    db.companies.create_index(fields)