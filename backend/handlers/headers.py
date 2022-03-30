import json
import tornado
from handlers.base import BaseHandler


class ClientHeaders(BaseHandler):
    # def initialize(self, *args, **kwargs):
    #     self.headers = self.request.headers.copy()

    def get(self):
        self.write(json.dumps(dict((k,v) for (k,v) in self._headers.items())))