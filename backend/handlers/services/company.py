import tornado
import json
from handlers.base import BaseHandler
jsond = lambda x : json.dumps(x, indent=4)

def mongo2json(mongo_obj):
    mongo_obj_list = []
    for obj in mongo_obj:
        if '_id' in obj:
            del obj['_id']
        mongo_obj_list.append(obj)
    return jsond(mongo_obj_list)

 
class CompanyProfile(BaseHandler):
    def get(self):
        isin = self.get_query_argument('isin')
        company_profile = self.db.companies.find_one({'ISIN': isin})
        if company_profile:
            del company_profile['_id']
        else:
            company_profile = {'msg': 'Not Found'}
        self.write(json.dumps(company_profile, ensure_ascii=False))


class CompanyProfileMini(BaseHandler):
    def get(self):
        isin = self.get_query_argument('isin')
        company_profile = self.db.companies.find_one({'ISIN': isin})
        if company_profile:
            del company_profile['_id']
            if 'documents' in company_profile:
                del company_profile['documents']
            if 'clients_trade_data' in company_profile:
                del company_profile['clients_trade_data']
            isin_data = company_profile.get('daily_trade_data').copy()
            isin_data.sort(key=lambda item:item['date'], reverse=True)
            company_profile['daily_trade_data'] = isin_data
        else:
            company_profile = {'msg': 'Not Found'}
        self.write(json.dumps(company_profile, ensure_ascii=False))
        

class DocumentCompanyProfile(BaseHandler):
    def get(self, isin):
        isin = self.get_query_argument('isin')
        company_profile = self.db.companies.find_one({'ISIN': isin})
        payload = []
        for doc in company_profile.get('documents'):
            record = {
                'title': doc.get('title'),
                'doc_sent_date': doc.get('doc_sent_date').strftime('%Y-%m-%d'),
                'doc_publish_date': doc.get('doc_publish_date').strftime('%Y-%m-%d'),
                'report_dates': doc.get('report_dates'),
                'files': doc.get('doc')
            }
            payload.append(record)
        self.write(json.dumps(payload))


class MarketSearchRecords(BaseHandler):
    def post(self):
        data = tornado.escape.json_decode(self.request.body) or {}
        result = self.db.companies.find({"$text": {"$search": data.get('query')}})
        results = []
        for i in result:
            if 'daily_trade_data' in i:
                del i['daily_trade_data']
            results.append(i)
        self.write(mongo2json(results))