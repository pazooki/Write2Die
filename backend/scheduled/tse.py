import re
import requests
import datetime
import jdatetime
import os
import sys
import json
import requests
import json
import traceback

from pathlib import Path
from requests import HTTPError
from concurrent import futures
from bs4 import BeautifulSoup
from time import sleep, time
from dateutil.parser import parse
from requests.adapters import HTTPAdapter
from urllib3 import Retry
from ast import literal_eval

from config import db, es_cli, setup_logger
import logging
setup_logger('Tajiran.import', os.path.join('/home/mehrdadpazooki/', 'Tajiran.import.log'))
log = logging.getLogger('Tajiran.import')


HISTORY_FIELD_MAPPINGS = {
    "<DTYYYYMMDD>": "date",
    "<FIRST>": "open",
    "<HIGH>": "high",
    "<LOW>": "low",
    "<LAST>": "close",
    "<VOL>": "volume",
    "<CLOSE>": "adjClose",
    "<OPENINT>": "count",
    "<VALUE>": "value",
    "<OPEN>": "yesterday",
}

SHAREHOLDERS_FIELD_MAPPINGS = {
    "سهامدار/دارنده": "shareholder",
    "سهم": "shares",
    "درصد": "percentage",
    "تغییر": "change",
}

TSE_INSTRUMENT_EXPORT_DATA_ADDRESS = (
    "http://tsetmc.com/tsev2/data/Export-txt.aspx?t=i&a=1&b=0&i={}"
)
TSE_TICKER_ADDRESS = (
    "http://tsetmc.com/Loader.aspx?ParTree=151311&i={}"
)
TSE_ISNT_INFO_URL = (
    "http://www.tsetmc.com/tsev2/data/instinfofast.aspx?i={}&c=57+"
)
TSE_CLIENT_TYPE_DATA_URL = (
    "http://www.tsetmc.com/tsev2/data/clienttype.aspx?i={}"
)
# use instrument id as argument
TSE_SHAREHOLDERS_URL = (
    "http://www.tsetmc.com/Loader.aspx?Partree=15131T&c={}"
)



def requests_retry_session(retries=150, backoff_factor=0.3, status_forcelist=(500, 502, 504, 503), session=None):
    session = session or requests.Session()
    retry = Retry(total=retries, read=retries, connect=retries, backoff_factor=backoff_factor, status_forcelist=status_forcelist)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def make_path(path):
    try:
        if os.path.exists(path):
            os.renames(path, path + '__' + str(int(time())))
        log.info('Creating dir for %s' % path)
        os.mkdir(path)
    except Exception as exc:
        log.info(['Could not create the directory. ', exc])

def find_record(records, f_func):
    data = None
    if type(records) == dict:
        data = records.items()
    elif type(records) == list:
        data = records
    result = list(filter(f_func, data))
    if result:
        return result
    else:
        return {}


def extract_jalali_date_to_gregorian(text):
    if not text:
        return [{'jalali': '', 'gregorian': ''}]
    extracted_dates = re.findall(r'\b\d{4}/\d\d?/\d\d?\b', text)
    return [{'jalali': _date, 'gregorian': jalali_date_to_gregorian(_date)} for _date in extracted_dates]

def jalali_date_to_gregorian(jalali_date):
    # '00/2/30 16:51'
    if not jalali_date:
        return ''
    try:
        _date, _time = jalali_date.split(' ') if ' ' in jalali_date else (jalali_date, '00:00')
        _y, _m, _d = _date.split('/')
        _hour, _minute = _time.split(':')
        if len(_y) < 4:
            if _y.startswith('0'):
                _y = '14' + _y
            else:
                _y = '13' + _y
            
        # log(int(_d), int(_m), int(_y), int(_hour), int(_minute))
        jalali_dt = jdatetime.datetime(day=int(_d), month=int(_m), year=int(_y), hour=int(_hour), minute=int(_minute))
    except Exception as ex:
        if _d == 30:
            # log(ex, jalali_date, 'trying day - 1 to fix it.')
            _d = 29
            jalali_dt = jdatetime.datetime(day=int(_d), month=int(_m), year=int(_y), hour=int(_hour), minute=int(_minute))
            return jalali_dt
        # log(int(_d), int(_m), int(_y), int(_hour), int(_minute))
        # log(ex, jalali_date, type(jalali_date))
        return ''
    else:
        return jalali_dt.togregorian()

def strip_symbols(symbol):
    return ''.join(filter(lambda x: x != None, map(lambda x: x if x.isdigit() is False else None, symbol)))   
        


class GetTop:
    def __init__(self, db):
        self.db = db
        self.incoming_data = []
        self.latest_date = '2020-01-01'
        self.max_value = 0
        self.min_value = 0
        self.industry_code_map = {}
    
    def update_latest_date(self, date):
        self.latest_date = max([date, self.latest_date], key=lambda d: datetime.datetime.strptime(d, '%Y-%m-%d'))

    def prepare(self):
        for company in self.db.companies.find({}):
            if 'daily_trade_data' in company and len(company['daily_trade_data']) > 2:
                sorted_trade_data = sorted(
                    company.get('daily_trade_data'), 
                    key=lambda x: datetime.datetime.strptime(x.get('date'), '%Y-%m-%d')
                )
                past_day_data = sorted_trade_data[-2]
                latest_date_data = sorted_trade_data[-1]
                _latest_date = datetime.datetime.strptime(latest_date_data.get('date'), '%Y-%m-%d')
                _last_update = datetime.datetime.strptime(company.get('last_update'), '%Y-%m-%d')
                if _latest_date > (_last_update - datetime.timedelta(days = 2)):
                    self.incoming_data.append({
                        'ISIN': company.get('ISIN'), 
                        'company': company.get('company', 'N/A').strip(),
                        # 'name_en': company.get('name_en').split('-')[0],
                        'company_name_en': company.get('company_name_en'),
                        'industry': company.get('industry'), 
                        'industry_code': company.get('industry_code'), 
                        'latest_date_data': latest_date_data, 
                        'past_day_data': past_day_data
                    })
                    self.industry_code_map[company.get('industry_code')] = company.get('industry')
                    log.info(latest_date_data.get('date'))
                    self.update_latest_date(latest_date_data.get('date'))

    def top_n_by_value(self, n):
        outgoing_data = sorted(self.incoming_data, key=lambda x: int(x.get('latest_date_data').get('value')), reverse=True)[:n]
        db_payload = {}
        for profile in outgoing_data:
            diff_value = int(profile.get('latest_date_data').get('value')) - int(profile.get('past_day_data').get('value'))
            db_payload[profile.get('ISIN')] = {
                'ISIN': profile.get('ISIN'), 
                'company': profile.get('company'),
                # 'name_en': profile.get('name_en').split('-')[0],
                'company_name_en': profile.get('company_name_en'),
                'industry': profile.get('industry'), 
                'industry_code': profile.get('industry_code'), 
                'diff_value': diff_value
            }
            self.update_min_max_value(diff_value)

        self.db.overview_data.top_50_by_value.insert_one({
            'date': self.latest_date, 
            'min_value': self.min_value,
            'max_value': self.max_value,
            'data': db_payload
        })
    

    def top_n_by_value_by_industry(self, n):
        grouped_by_code = {}
        for profile in self.incoming_data:
            if profile.get('industry_code') not in grouped_by_code:
                grouped_by_code[profile.get('industry_code')] = []
            grouped_by_code[profile.get('industry_code')].append(profile)

        grouped_by_code_cut_by_n = {}
        for code, symbols_data in grouped_by_code.items():
            grouped_by_code_cut_by_n[code] = sorted(
                    symbols_data,
                    key=lambda x: int(x.get('latest_date_data').get('value')), 
                reverse=True
            )[:n]

        db_payload = {}
        for code, symbols_data in grouped_by_code_cut_by_n.items():
            if code not in db_payload:
                db_payload[code] = {'code': code, 'industry_name': self.industry_code_map[code], 'companies': []}
            for symbol in symbols_data:
                diff_value = int(symbol.get('latest_date_data').get('value')) - int(symbol.get('past_day_data').get('value'))
                db_payload[code]['companies'].append({
                    'ISIN': symbol.get('ISIN'), 
                    'company': symbol.get('company'),
                    # 'name_en': symbol.get('name_en').split('-')[0],
                    'company_name_en': symbol.get('company_name_en'),
                    'industry': symbol.get('industry'), 
                    'industry_code': symbol.get('industry_code'), 
                    'diff_value': diff_value
                })
                self.update_min_max_value(diff_value)

        self.db.overview_data.top_7_by_value_by_industry.insert_one({
            'date': self.latest_date, 
            'min_value': self.min_value,
            'max_value': self.max_value,
            'data': db_payload
        })


    def update_min_max_value(self, diff_value):
        self.max_value = max(self.max_value, diff_value)
        self.min_value = min(self.min_value, diff_value)


class TSE:
    def __init__(self, db):
        self.db = db
        self.current_date = datetime.datetime.now()
        self.authoritative_records = {}
        self.authoritative_records_final = {}
        self.instrument_codes = {}
        self.basic_info = {}
        self.trade_data = {}
        self.instruments = {}
        self.lock_data_import = "/home/mehrdadpazooki/__data_import__.lock"
        self.import_report = {}

    def update_companies_collection(self):
        log.info('Make Companies Profile Collection...')

        data = {}
        for isin, rec in self.basic_info.items():
            try:
                i = self.instruments.get(isin)
                inst_c = find_record(self.instrument_codes, lambda x: x[1].get('ISIN') == isin)
                inst_c_d = None
                inst_c_record = {}
                if inst_c and len(inst_c[0]) > 0 and inst_c[0][1]:
                    inst_c_record = inst_c[0][1] or {}
                    inst_c_d = inst_c_record.get('instrument_code', None)
                sh = self.trade_data.get(inst_c_d, {})
                # se = find_record(self.search, lambda x: x[1].get('ISIN') == isin)
                co = find_record(self.companies.get('data'), lambda x: x.get('id') == isin)
            except Exception as ex:
                log.info(traceback.format_exc())
                # import ipdb;ipdb.set_trace(context=ex.__context__)
            else:
                data[isin] = {}
                try:
                    data[isin].update(rec)
                    data[isin].update(i.get(isin, {}))
                    data[isin].update(inst_c_record)
                    data[isin].update(sh.get(isin, {}))
                    # data[isin].update(se[0][1])
                    data[isin].update(co[0] if co else {})
                except Exception as ex:
                    log.info(traceback.format_exc())
                    # import ipdb;ipdb.set_trace(context=ex.__context__)
            finally:
                try:
                    if data[isin]:
                        naked_symbol = strip_symbols(data[isin].get('company', '')) or strip_symbols(data[isin].get('symbol', ''))
                        p = self.db.companies.find_one({'symbol': naked_symbol})
                        if p:
                            data[isin]['tse_symbol'] = naked_symbol
                            data[isin]['daily_trade_data'] = p.get('daily_trade_data')
                    else:
                        data[isin]['tse_symbol'] = None
                        data[isin]['daily_trade_data'] = []
                except Exception as ex:
                    log.info(traceback.format_exc())
                    # import ipdb;ipdb.set_trace(context=ex.__context__)
                else:
                    self.db.companies.update_one({'isin': isin}, {'$set': data[isin]}, upsert=True)
        self.store_in_file(data, 'profiles')


    def insert_instrument(self, val):
        data = {
            val[3]: {
                'company_name': val[0],
                'symbol': val[1],
                'status': val[2],
                'ISIN': val[3]
            }
        }
        # log.info(['Company: %s , ISIN: %s ' % (val[0], str(val[3]))])
        self.instruments.update(data)


    def call_get_instrument_uri(self, uri_instrument):
        try:
            r = requests.get(uri_instrument)
            if r.status_code == 200:
                try:
                    js = json.loads(r.text.encode().decode('utf-8-sig'))
                except Exception as ex:
                    log.info(ex)
                else:
                    return js
        except Exception as ex:
            log.info(ex)
            return None

    def updateInstrumentURI(self, uri_instrument):
        log.info(['Update Instrument...', uri_instrument])
        js = None
        while js is None:
            js = self.call_get_instrument_uri(uri_instrument)
            if not js:
                sleep(2)
        if js:
            for alphabet in range(len(js['companies'])):
                for idx in range(len(js['companies'][alphabet]['list'])):
                    name = js['companies'][alphabet]['list'][idx]['n']
                    symbol = js['companies'][alphabet]['list'][idx]['sy']
                    status = js['companies'][alphabet]['list'][idx]['s']
                    ISIN = js['companies'][alphabet]['list'][idx]['ic']
                    val = (name, symbol, status, ISIN)
                    self.insert_instrument(val)

    def updateInstrument(self):
        self.updateInstrumentURI('http://tse.ir/json/Listing/ListingByName1.json')
        self.updateInstrumentURI('http://tse.ir/json/Listing/ListingByName2.json')
        self.updateInstrumentURI('http://tse.ir/json/Listing/ListingByName3.json')
        self.updateInstrumentURI('http://tse.ir/json/Listing/ListingByName4.json')
        self.updateInstrumentURI('http://tse.ir/json/Listing/ListingByName5.json')
        self.updateInstrumentURI('http://tse.ir/json/Listing/ListingByName7.json')

    def updateInstrumentCodes(self):
        uri = 'http://www.tsetmc.com/tsev2/data/MarketWatchInit.aspx?h=0&r=0'
        try:
            r = requests.get(uri)
            if r.status_code == 200:
                r.encoding = r.apparent_encoding
                csv = r.text
                rows = csv.split(';')
                l_rows = len(rows)
                for i, row in enumerate(rows):
                    if i == 0:
                        continue
                    cols = row.split(',')
                    if len(cols[1]) > 3:
                        record = {
                            cols[0]: {
                                'instrument_code': cols[0],
                                'ISIN': cols[1],
                                'company': cols[2],
                                'symbol': cols[3]
                            }
                        }
                        # log.info('Idx: %d / %d - ISIN: %s' % (i, l_rows, cols[1]))
                        self.instrument_codes.update(record)
        except Exception as e:
            log.info(f"Error updateInstrumentCodes: {e}")


    def call_get_basic_info(self, uri):
        try:
            r = requests.get(uri)
        except Exception as e:
            log.info(["Error updateBasicInfo", uri])
        else:
            if r.status_code == 200:
                r.encoding = r.apparent_encoding
                soup = BeautifulSoup(r.text, 'html.parser')
                basic_info = [
                    x.select('td:nth-of-type(2)')[0].get_text() for x in soup.select('table:nth-of-type(1) tbody tr')
                ]
                return basic_info

    def updateBasicInfo(self, _datetime):
        log.info('Update Basic Info....')
        instrument_codes_record = self.db.imported.instrument_codes.find().sort('date', -1).limit(1)
        if instrument_codes_record:
            for record in instrument_codes_record[0].get('instrument_codes'):
                ISIN = record.get('ISIN')
                uri_basicinfo = f"http://tse.ir/json/Instrument/BasicInfo/BasicInfo_{ISIN}.html"
                rec = None
                # log.info([ISIN, uri_basicinfo])
                rec = self.call_get_basic_info(uri_basicinfo) or None
                # log.info(rec)
                if rec:
                    data = {
                        rec[0]: {
                            'ISIN': rec[0],
                            'company_name': rec[1],
                            'symbol': rec[2],
                            'company_name_en': rec[3],
                            'symbol_en': rec[4],
                            'CISIN': rec[5],
                            'tableau': rec[6],
                            'industry': rec[7],
                            'industry_code': rec[8],
                            'subindustry': rec[9],
                            'subindustry_code': rec[10],
                            'instrument_code': record.get('instrument_code')
                        }
                    }
                    log.info(['Company:', rec[0], record.get('instrument_code')])
                    self.db.imported.basic_info.update_one({'date': _datetime}, {'$addToSet': {'basic_info': data}}, upsert=True)
    
    def call_get_info(self, uri):
        try:
            r = requests.get(uri)
            if r.status_code == 200:
                records = r.text.split(';')
                return records
        except Exception as ex:
            log.info(ex)
            return None

    # def updateTradeData(self):
    #     log.info('Update Information...')
    #     basic_info = self.db.imported.instrument_codes.find().sort('date', -1).limit(1)

    #     for isin, company in basic_info.get('basic_info').items():
    #         instrument_code = company.get('instrument_code')
    #         uri = f"http://members.tsetmc.com/tsev2/data/InstTradeHistory.aspx?i={instrument_code}&Top=99999999&A=1"
    #         records = None
    #         while records is None:
    #             records = self.call_get_info(uri)
    #             if records:
    #                 for record in records:
    #                     rec = record.split('@')
    #                     if len(rec) != 10:
    #                         continue
    #                     date = parse(rec[0]).strftime('%Y-%m-%d')
    #                     if instrument_code not in self.trade_data:
    #                         self.trade_data[instrument_code] = {}
    #                     data = {
    #                         date: {
    #                             'instrument_code': instrument_code,
    #                             'date': date,
    #                             'high': rec[1],
    #                             'low': rec[2],
    #                             'price_last': rec[3],
    #                             'price_last_contract': rec[4],
    #                             'open': rec[5],
    #                             'price_yesterday': rec[6],
    #                             'value': rec[7],
    #                             'volume': rec[8],
    #                             'cnt': rec[9],
    #                         }
    #                     }
    #                     log.info("Instrument Code: %s" % data)
    #                     self.trade_data[instrument_code].update(data)
    #             else:
    #                 sleep(2)

    def updateCompanyData(self):
        future_to_trade_data = {}
        basic_info = self.db.imported.basic_info.find().sort('date', -1).limit(1)[0]
        instrument_codes = [list(company)[0].get('instrument_code') for company in [b.values() for b in basic_info.get('basic_info')]]
        # We can use a with statement to ensure threads are cleaned up promptly
        with futures.ThreadPoolExecutor(max_workers=3) as executor:
            # Start the load operations and mark each future with its URL
            future_to_trade_data = {executor.submit(self.get_daily_data, instrument_code): instrument_code for instrument_code in instrument_codes}
            for future in futures.as_completed(future_to_trade_data):
                instrument_code = future_to_trade_data[future]
                log.info(['updateCompanyData: ', instrument_code])
                try:
                    company_daily_data = future.result()
                    basic_info = self.db.companies.find_one({'instrument_code': instrument_code})
                    company = {k:v for k,v in basic_info.items()} # get company info
                    company.update(company_daily_data)
                    company['last_update'] = datetime.datetime.now().strftime('%Y-%m-%d')
                    
                    log.info(['updateCompanyData: ', instrument_code])
                    
                    self.db.companies.update_one({'instrument_code': instrument_code} ,{'$set': company}, upsert=True)
                    # self.db.imported.basic_info.update_many({'basic_info.instrument_code': instrument_code}, {'$addToSet' : {"basic_info.trade_data" : trade_data_rows}}, upsert=True)
                    self.import_report[instrument_code] = {
                        'instrument_code': instrument_code, 
                        'documents': len(company.get('documents')),
                        'clients_trade_data': len(company.get('clients_trade_data')),
                        'daily_trade_data': len(company.get('daily_trade_data')),
                        'errors': None
                    }
                except Exception as exc:
                    self.import_report[instrument_code] = {
                        'errors': exc
                    }
                    log.info(exc)
                    log.info(traceback.format_exc())
                else:
                    del company_daily_data
                    del company

    def get_daily_data(self, instrument_code):
        trade_rows = self.get_daily_trade_data(instrument_code)
        clients_trade_rows = self.get_daily_clients_trade_data(instrument_code)
        documents = self.get_daily_documents(instrument_code)
        return {'documents': documents, 'clients_trade_data': clients_trade_rows, 'daily_trade_data': trade_rows}


    def get_daily_documents(self, instrument_code):
        try:
            r = requests.get('http://www.tsetmc.com/loader.aspx?ParTree=151311&i=%s' % instrument_code)
        except Exception as ex:
            log.info([instrument_code, ex])
        else:
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'lxml')
                codal_data = re.search('var CodalData=(.+)[,;]{1}', str(soup.find_all('script')[-1]))
                company_documents = literal_eval(codal_data.group(1).replace(";ens('i', version); ii = InstInfo()", ''))
                documents = []
                codal_obj = None
                if len(company_documents) >= 0:
                    for codal in company_documents:
                        codal_code = codal[0]
                        if codal[7] == 2 or codal[8] == 2:
                            report_dates = extract_jalali_date_to_gregorian(codal[3])
                            title = codal[3]
                            for _date in report_dates:
                                title = title.replace(_date.get('jalali'), _date.get('gregorian').strftime('%Y-%m-%d') if type(_date.get('gregorian')) is not str else _date.get('gregorian'))
                            codal_obj = {
                                'codal_code': codal_code,
                                'title': title,
                                'doc_sent_date': jalali_date_to_gregorian(codal[4]).strftime('%Y-%m-%d'),
                                'doc_publish_date': jalali_date_to_gregorian(codal[5]).strftime('%Y-%m-%d'),
                                'report_dates': report_dates,
                                'doc': []
                            }
                        if codal[7] == 2:
                            # log.info(['http://cdn8.tsetmc.com/tsev2/data/CodalData.aspx?t=e&i=%s' % codal_code, codal[3], 'format: xls',
                                    # 'Sent Date: %s, Publishing Date: %s' % (codal[4], codal[5])])
                            codal_obj['doc'].append(
                                    {
                                        'url': 'http://cdn8.tsetmc.com/tsev2/data/CodalData.aspx?t=e&i=%s' % codal_code,
                                        'format': 'xls'
                                    }
                            )
                        if codal[8] == 2:
                            # log.info(['http://cdn8.tsetmc.com/tsev2/data/CodalData.aspx?t=p&i=%s' % codal_code, codal[3], 'format: pdf',
                            #         'Sent Date: %s, Publishing Date: %s' % (codal[4], codal[5])])
                            codal_obj['doc'].append(
                                    {
                                        'url': 'http://cdn8.tsetmc.com/tsev2/data/CodalData.aspx?t=p&i=%s' % codal_code,
                                        'format': 'pdf'
                                    }
                            )
                        if codal_obj:
                            documents.append(codal_obj)
                return documents
            else:
                return []

    def get_daily_trade_data(self, instrument_code):
        url = TSE_INSTRUMENT_EXPORT_DATA_ADDRESS.format(instrument_code)
        with requests_retry_session() as session:
            response = session.get(url, timeout=10)
        try:
            response.raise_for_status()
        except HTTPError:
            return self.get_daily_trade_data(instrument_code)
        
        trade_rows = []
        for idx, row in enumerate(response.text.split('\n')):
            if idx == 0:
                continue
            columns = row.strip().split(',')
            if len(columns) < 10:
                continue
            HISTORY_FIELD_MAPPINGS = {
                "<DTYYYYMMDD>": "date", "<FIRST>": "open", "<HIGH>": "high", "<LOW>": "low", "<CLOSE>": "adjClose", "<VALUE>": "value",
                "<VOL>": "volume", "<OPENINT>": "count", "<PER>": "unit", "<OPEN>": "yesterday", "<LAST>": "close"
            }
            # '<DTYYYYMMDD>,<FIRST>,<HIGH>,<LOW>,<CLOSE>,<VALUE>,<VOL>,<OPENINT>,<PER>,<OPEN>,<LAST>\r'
            trade_data_row = {
                'date': parse(columns[1]).strftime('%Y-%m-%d'),
                'open': columns[2],
                'high': columns[3],
                'low': columns[4],
                'adjusted_close': columns[5],
                'value': columns[6],
                'volume': columns[7],
                'count': columns[8],
                'unit': columns[9],
                'yesterday': columns[10],
                'close': columns[11],
            }
            trade_rows.append(trade_data_row)
        return trade_rows

    def get_daily_clients_trade_data(self, instrument_code):
        url = TSE_CLIENT_TYPE_DATA_URL.format(instrument_code)
        with requests_retry_session() as session:
            response = session.get(url, timeout=5)
        rows = response.text.split(";")
        
        client_trades_rows = []
        for row in rows:
            columns = row.split(',')
            if (len(columns) < 12):
                continue
            # '20210227,1522,9,31838,20,10893007,80000,10965618,7389,143351972120,1052800000,144307532880,97239240'
            data = {
                "date": parse(columns[0]).strftime('%Y-%m-%d'),
                "individual_buy_count": columns[1], 
                "corporate_buy_count": columns[2],
                "individual_sell_count": columns[3], 
                "corporate_sell_count": columns[4],
                "individual_buy_vol": columns[5], 
                "corporate_buy_vol": columns[6],
                "individual_sell_vol": columns[7], 
                "corporate_sell_vol": columns[8],
                "individual_buy_value": columns[9], 
                "corporate_buy_value": columns[10],
                "individual_sell_value": columns[11], 
                "corporate_sell_value": columns[12]
            }
            client_trades_rows.append(data)
        return client_trades_rows


    def elasticSearchDataImport(self):
        drop_index = es_cli.indices.create(index='profile_index', ignore=400)
        create_index = es_cli.indices.delete(index='profile_index', ignore=[400, 404])

        idx = 1
        # total = db.companies.count()
        for doc in db.companies.find():
            del doc['_id']
            if 'daily_trade_data' in doc:
                del doc['daily_trade_data']
            if 'documents' in doc:
                del doc['documents']
            if 'clients_trade_data':
                del doc['clients_trade_data']
            
            res = es_cli.index(index="profile_index", body=doc)
            log.info(res)
            idx += 1
            sleep(0.01)

    def update(self):
        # Only needed to prepare BasicInfo if new instruments added to the market
        
        basic_info = [i for i in self.db.imported.basic_info.find().sort('date', -1).limit(1)]
        
        if len(basic_info) > 0 and basic_info[0].get('date') and (len(basic_info[0].get('basic_info')) == 0):
            log.info('Basic Info Is Updating...')
            log.info('1- updateInstrumentCodes...')
            self.updateInstrumentCodes()
            self.db.imported.instrument_codes.update_one({'date': datetime.datetime.now()}, {'$set': 
                {
                    'date': datetime.datetime.now(),
                    'instrument_codes': list(self.instrument_codes.values()),
                }
            }, upsert=True)
            log.info('2- updateInstrument...')
            self.updateInstrument()
            self.db.imported.instruments.update_one({'date': datetime.datetime.now()}, {'$set': 
                {
                    'date': datetime.datetime.now(),
                    'instruments': list(self.instruments.values())
                }
            }, upsert=True)
            _datetime = datetime.datetime.now()
            log.info('3- updateBasicInfo...')
            self.db.imported.basic_info.update_one({'date': _datetime}, { '$set': 
                {
                    'date': datetime.datetime.now(),
                    'basic_info': []
                }
            }, upsert=True)
            self.updateBasicInfo(_datetime)

        log.info('updateCompanyData...')
        self.updateCompanyData()
        log.info('GetTop - Update Market Overview')
        get_top = GetTop(db)
        get_top.prepare()
        get_top.top_n_by_value(50)
        get_top.top_n_by_value_by_industry(7)
        log.info('Elastic Search Update..')
        log.info('elasticSearchDataImport...')
        self.elasticSearchDataImport()
        
        # TOOD: Add MarketWatch Data https://tse.ir/MarketWatch-ang.html?cat=tradeOption
            
    def touch_final(self):
        log.info(['touch_final import_report:', self.import_report.keys()])
        if self.import_report:
            self.db.imported.report.update_one({'key': 'latest_import'}, {'$set':{'date': datetime.datetime.now(), 'report': self.import_report}}, upsert=True)
        log.info(['Removing ', self.lock_data_import])
        os.remove(self.lock_data_import)

            
    def is_new_data_available(self):
        check_url = 'http://tsetmc.com/tsev2/data/Export-txt.aspx?t=i&a=1&b=0&i=62235397452612911'
        with requests_retry_session() as session:
            response = session.get(check_url, timeout=10)
        top_line = response.text.split('\n')[1]
        date = top_line.split(",")[1]
        imported_data = self.db.imported.report.find_one({'key': 'latest_date'}) or {}
        imported_data_date = imported_data.get('date', parse('2000-01-01'))
        log.info(['New Data', parse(date), 'Old Data', imported_data_date, parse(date) > imported_data_date])
        if (parse(date) > imported_data_date):
            return date
        else:
            return False
        
    def handle_lock(self):
        now = datetime.datetime.now()
        ts = now.strftime("%Y-%m-%d %H:%M:%S")
        log.info("tse.py - " + ts)
        if os.path.exists(self.lock_data_import):
            log.info(self.lock_data_import + " exists.")
            sys.exit()
        else:
            Path(self.lock_data_import).touch()

if __name__ == '__main__':
    while True:
        tse = TSE(db)
        tse.handle_lock()
        if tse.is_new_data_available():
            tse.update()
            tse.touch_final()
        sleep(60 * 60 * 60 * 1) # Every 12 Hours
    