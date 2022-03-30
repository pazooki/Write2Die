from datetime import datetime
import json

from handlers.base import BaseHandler


class OverviewMarketMap(BaseHandler):
    def get(self):
        for market_map in self.db.overview_data.top_50_by_value.find().sort("date", -1).limit(1):
            del market_map['_id']
            self.write(json.dumps(market_map))


class OverviewMarketMapByIndustry(BaseHandler):
    def get(self):
        for market_map_by_industry in self.db.overview_data.top_7_by_value_by_industry.find().sort("date", -1).limit(1):
            del market_map_by_industry['_id']
            self.write(json.dumps(market_map_by_industry))