import json

from dateutil.parser import parse
import tornado
from handlers.base import BaseHandler


def is_a_valid_date(string, fuzzy=False):
    try:
        parse(string, fuzzy=fuzzy)
        return True
    except ValueError:
        return False


class MarketSearchRecordsQuery(BaseHandler):
    def get(self, query):
        search_records = self.db.search_records.find_one().get('data')
        records = [x for x in filter(lambda x: x[0] == query, search_records)]
        if len(records)> 0:
            self.write(json.dumps(records[0]))
        else:
            record = {'msg': 'Not Found'}
            self.write(json.dumps(record))


class MarketMetaDataHandler(BaseHandler):
    def get(self):
        meta_data = {
            'latest_market_date': self.db.meta_data.find_one(
                {'key': 'latest_date'}
            ).get('value').strftime('%Y-%m-%d')
        }
        self.write(json.dumps(meta_data))


class MarketDateListingHandler(BaseHandler):
    def get(self, target_date):
        assert is_a_valid_date(target_date)
        # symbols = {
        #     "data": []
        # }
        # for symbol_data in self.db.latest_symbols_daily_report.find():
        #     symbols["data"].append(symbol_data)
        # self.write(json.dumps(symbols))


class MarketListingLatestHandler(BaseHandler):
    def get(self):
        symbols = {"data": []}
        for symbol_data in self.db.latest_symbols_daily_report.find():
            del symbol_data['_id']
            symbols["data"].append(symbol_data)
        self.write(json.dumps(symbols))


class MarketListingHandler(BaseHandler):
    def get(self):
        symbols = []
        for doc in self.db.companies.find():
            symbol = {
                'symbol': doc.get('symbol'),
                'symbol_tse_code': doc.get('symbol_tse_code'),
                'first_date': min(doc.get('daily_trade_data').keys()),
                'last_date': max(doc.get('daily_trade_data').keys())
            }
            symbols.append(symbol)
        self.write(json.dumps(symbols))
