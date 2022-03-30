import re
import jdatetime
from config import db

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
            
        print(int(_d), int(_m), int(_y), int(_hour), int(_minute))
        jalali_dt = jdatetime.datetime(day=int(_d), month=int(_m), year=int(_y), hour=int(_hour), minute=int(_minute))
    except Exception as ex:
        if int(_d) > 28:
            print(ex, jalali_date, 'trying day - 1 to fix it.')
            _d = str(int(_d) - 1)
            return jalali_date_to_gregorian(_y + '/' + _m + '/' + _d)
            
        print(int(_d), int(_m), int(_y), int(_hour), int(_minute))
        print(ex, jalali_date, type(jalali_date))
        return ''
    else:
        return jalali_dt.togregorian()


def fix_document_dates():
    for company in db.companies.find({}):
        print(company.get('ISIN'))
        docs = []
        codals = set()
            
        for idx, document in enumerate(company.get('documents')):
            
            if document.get('codal_code') in codals:
                continue
            else:
                codals.add(document.get('codal_code'))
                
            report_dates = []
            for _date in document.get('report_dates'):
                print(_date)
                jalali = _date.get('jalali')
                gregorian = _date.get('gregorian')
                if not gregorian:
                    gregorian = jalali_date_to_gregorian(jalali)
                if type(gregorian) is not str:
                    gregorian = gregorian.strftime('%Y-%m-%d')
                # document['title'] = document['title'].replace(jalali, gregorian)
                document['title'] = document['title'].replace(gregorian, '(تاریخ گزارش)')
                print(idx, document.get('codal_code'), document['title'])
                report_dates.append({'jalali': jalali, 'gregorian': gregorian})
            document['report_dates'] = report_dates
            document['doc_sent_date'] = document.get('doc_sent_date').strftime('%Y-%m-%d') if type(document.get('doc_sent_date')) is not str else document.get('doc_sent_date')
            document['doc_publish_date'] = document.get('doc_publish_date').strftime('%Y-%m-%d') if type(document.get('doc_publish_date')) is not str else document.get('doc_publish_date')
            docs.append(document)
        company['documents'] = docs
        db.companies.update_one({'_id': company.get('_id')}, {'$set': company})


def unique_documents():
    for company in db.companies.find({}):
        print(company.get('ISIN'))
        codals = set()
        docs = []
        for idx, document in enumerate(company.get('documents')):
            if document.get('codal_code') not in codals:
                codals.add(document.get('codal_code'))
                docs.append(document)
        company['documents'] = docs
        db.companies.update_one({'_id': company.get('_id')}, {'$set': company})
        
    

if __name__ == '__main__':
    fix_document_dates()
    # unique_documents()
    # print(jalali_date_to_gregorian('1397/12/31'))