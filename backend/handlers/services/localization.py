import json
from uuid import uuid4
import tornado
from handlers.base import BaseHandler
from config import db, log
# from googletrans import Translator
import google.auth
from google.cloud import translate
from time import time

'''
        # date_is_in_text = re.findall(r'\b\d{4}\/\d\d?\/\d\d?\b', text)
        jalali_date = None
        gregorian_date = None
        # if date_is_in_text:
            # pass
            # jalali_date = date_is_in_text[0]
            # gregorian_date = jdatetime.datetime(
            #     int(jalali_date.split('/')[0]),
            #     int(jalali_date.split('/')[1]),
            #     int(jalali_date.split('/')[2])
            # ).togregorian().strftime('%Y-%m-%d')
            # text = text.split(jalali_date)
        # else:
'''

_, PROJECT_ID = google.auth.default()
PARENT = 'projects/{}'.format(PROJECT_ID)
TRANSLATE = translate.TranslationServiceClient()
SOURCE, TARGET = ('en', 'English'), ('fa', 'Farsi')


class Cache:
    def __init__(self, db):
        self.db = db
        
    def update(self, key):
        record = self.db.cache.find_one({'key': key})
        if record:
            del record['_id']
            record['updated_ts'] = int(time() * 1000)
            self.db.cache.update_one({'key': key}, {'$set': record}, upsert=True)
            return record
        else:
            now = int(time() * 1000)
            record = {'key': key, 'updated_ts': now, 'created_ts': now}
            self.db.cache.insert_one(record)
            return record

class CacheHandler(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body)
        if data.get('keys', []).length > 0:
            records = self.db.cache.find({'key': {'$in': data.get('keys', [])}})
        else:
            records = self.db.cache.find({})
        _records = []
        for record in records:
            del record['_id']
            _records.append(record)
        self.write(json.dumps(_records))
        

class LocalizationService:
    LANGUAGE_CODES = [
        'en',
        'fa',
        'tr',
        'zh',
        'es',
        'ar',
        'pt',
        'hi',
        'bn',
        'ru',
        'ja'
    ]

    def __init__(self):
        self.db = db
        self.cache = Cache(db)
        # self.translator = Translator()
        
    def updatedb(self, lang, text, hash_id):
        record = self.db.localizations.find_one({'id': hash_id})
        if record:
            del record['_id']
            record['localizations'][lang] = text
            self.db.localizations.update_one({'id': hash_id}, {'$set': record}, upsert=True)
            self.cache.update(hash_id)
        else:
            return {'lang': lang, 'text': text, 'hash_id': hash_id}
        return record

    def update(self, lang, text, hash_id):
        already_exists = self.db.localizations.count_documents(
            {"id": {"$exists": True, "$eq": hash_id}})
        if already_exists > 0:
            localizations = self.db.localizations.find_one({'id': hash_id})
            del localizations['_id']
            return localizations
        else:
            localizations = {'id': hash_id, 'localizations': {}}
            for lang_code in LocalizationService.LANGUAGE_CODES:
                # translated_text = self.translator.translate(
                #     text, src=lang, dest=lang_code if lang_code != 'zh' else 'zh-cn')
                if lang == lang_code:
                    translated_text = text
                else:
                    translated_text = LocalizationService.google_translate(text, source_language_code=lang, target_language_code=lang_code)
                localizations['localizations'][lang_code] = translated_text
            self.db.localizations.update_one({'id': hash_id}, {'$set': localizations}, upsert=True)
            self.cache.update(hash_id)
            return localizations
    
    @staticmethod
    def google_translate(text, source_language_code, target_language_code):
        data = {
            'contents': [text],
            'parent': PARENT,
            'source_language_code': source_language_code,
            'target_language_code': target_language_code,
        }
        try:
            rsp = TRANSLATE.translate_text(request=data)
        except Exception as ex:
            rsp = TRANSLATE.translate_text(**data)
            log.info(ex)
        translated = rsp.translations[0].translated_text
        return translated


class Localization(BaseHandler):

    def initialize(self, *args, **kwargs):
        super(Localization, self).initialize(*args, **kwargs)
        self.translationService = LocalizationService()

    def post(self):
        data = tornado.escape.json_decode(self.request.body)
        lang = data.get('lang')
        text = data.get('text')
        hash_id = data.get('hash_id')
        localizations = self.translationService.update(lang, text, hash_id)
        log.info([text, lang, hash_id, localizations])
        {'id': 'hash_id', 'localizations': {'code1': 'translation text', 'code2': 't2'}}
        self.write(json.dumps(localizations))

class LocalizationUpdate(BaseHandler):

    def initialize(self, *args, **kwargs):
        super(LocalizationUpdate, self).initialize(*args, **kwargs)
        self.translationService = LocalizationService()
        
    def post(self):
        data = tornado.escape.json_decode(self.request.body)
        lang = data.get('lang')
        text = data.get('text')
        hash_id = data.get('hash_id')
        localizations = self.translationService.updatedb(lang, text, hash_id)
        self.write(json.dumps(localizations))
        
    def get(self, hash_id = None):
        hash_id = hash_id or self.get_argument('hash_id')
        if not hash_id:
            pass
        localization = self.db.localizations.find_one({'id': hash_id})
        del localization['_id']
        self.write(json.dumps(localization))


# if __name__ == '__main__':
#     service = LocalizationService()
#     translations = service.update('en', 'Currency', '12345')
#     print(translations)
