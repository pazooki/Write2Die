class Datetime {
    constructor(State) {
        this.State = State;
    }
    jalaliCompletifyDateFmt = (date_str) => {
        var y = date_str.split('/')[0];
        var m = date_str.split('/')[1];
        var d = date_str.split('/')[2];
        if (y.length === 2 && y.startsWith('0')) {
            y = '14' + y;
        } else if (y.length === 2 && !y.startsWith('0')) {
            y = '13' + y;
        }
        return { 'yyyy': y, 'mm': m, 'dd': d };
    }

    convertJalaliStringDateTimeToGeorgian = (datetime) => {
        // datetime format '00/1/1 09:39'
        if (datetime === null || datetime.startsWith('20') || datetime.startsWith('19')) {
            return datetime;
        }
        var time = null;
        var date = null;
        if (datetime.split(' ').length > 0) {
            time = datetime.split(' ')[1];
            date = datetime.split(' ')[0];
        } else {
            date = datetime;
        }
        var jalaliDate = this.jalaliCompletifyDateFmt(date);
        var georgianDate = this.jalaliToGregorian(jalaliDate.yyyy, jalaliDate.mm, jalaliDate.dd);
        var georgianDateString = georgianDate.yyyy + '-' + georgianDate.mm + '-' + georgianDate.dd;
        if (time) {
            georgianDateString = georgianDateString + ' ' + time;
        }
        // console.log(jalaliDate, georgianDate, georgianDateString);
        return georgianDateString;
    }

    extractJalaliDateFromStringToGeorgian = (stringWithDatetime) => {
        // stringWithDatetime format 'آگهی دعوت به مجمع صندوق سرمایه گذاری در تاریخ 1399/04/10'
        // stringWithDatetime format 'Financial statements for the fiscal year ending 12/30/1399 (unaudited)'
        // stringWithDatetime format "1399 年 12 月 30 日结束的财政年度的财务报表（未经审计）"
        var date;
        var dateDoesNotConvertToGregorian = { 'jalaliDate': null, 'georgianDate': null, 'oridinalDate': null };
        var originalDate = null;
        date = stringWithDatetime.match(/\d{4}([.\-/ ])\d{2}\1\d{2}/);
        // console.log('matchin-1', date, stringWithDatetime);
        if (date === null) {
            date = stringWithDatetime.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            // console.log('matchin-2', date, stringWithDatetime);
            if (date === null || date[3].startsWith('20') || date[3].startsWith('19')) {
                return dateDoesNotConvertToGregorian;
            } else if (date !== null) {
                originalDate = date[0];
                date = date[3] + '/' + date[1] + '/' + date[2];
            } else {
                date = stringWithDatetime.match(/(\d{4})\s年\s(\d{2})\s月\s(\d{2})/);
                originalDate = date[0];
                // console.log('matchin-3', date, stringWithDatetime);
                if (date !== null && date.length === 4) {
                    date = date[1] + '/' + date[2] + '/' + date[3];
                } else {
                    // console.log('DATE NOT FOUND: ', stringWithDatetime);
                }
            }
        } else {
            date = date[0];
        }
        // console.log('final extracted date: ', date, stringWithDatetime);

        if (date) {
            return { 'jalaliDate': date, 'georgianDate': this.convertJalaliStringDateTimeToGeorgian(date), 'originalDate': originalDate };
        } else {
            return dateDoesNotConvertToGregorian;
        }
    }

    jalaliToGregorian = (j_y, j_m, j_d) => {
        var JalaliDate = {
            g_days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            j_days_in_month: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
        };

        j_y = parseInt(j_y);
        j_m = parseInt(j_m);
        j_d = parseInt(j_d);
        var jy = j_y - 979;
        var jm = j_m - 1;
        var jd = j_d - 1;

        var j_day_no = 365 * jy + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4);
        for (var i = 0; i < jm; ++i) j_day_no += JalaliDate.j_days_in_month[i];

        j_day_no += jd;

        var g_day_no = j_day_no + 79;

        var gy = 1600 + 400 * parseInt(g_day_no / 146097); /* 146097 = 365*400 + 400/4 - 400/100 + 400/400 */
        g_day_no = g_day_no % 146097;

        var leap = true;
        if (g_day_no >= 36525) /* 36525 = 365*100 + 100/4 */ {
            g_day_no--;
            gy += 100 * parseInt(g_day_no / 36524); /* 36524 = 365*100 + 100/4 - 100/100 */
            g_day_no = g_day_no % 36524;

            if (g_day_no >= 365) g_day_no++;
            else leap = false;
        }

        gy += 4 * parseInt(g_day_no / 1461); /* 1461 = 365*4 + 4/4 */
        g_day_no %= 1461;

        if (g_day_no >= 366) {
            leap = false;

            g_day_no--;
            gy += parseInt(g_day_no / 365);
            g_day_no = g_day_no % 365;
        }

        for (var i = 0; g_day_no >= JalaliDate.g_days_in_month[i] + (i == 1 && leap); i++)
            g_day_no -= JalaliDate.g_days_in_month[i] + (i == 1 && leap);
        var gm = i + 1;
        var gd = g_day_no + 1;

        gm = gm < 10 ? "0" + gm : gm;
        gd = gd < 10 ? "0" + gd : gd;

        return { 'yyyy': gy.toString(), 'mm': gm.toString(), 'dd': gd.toString() };
    }
}

export class Localization extends Datetime {
    /*
        TODO: 
            - Cleaning up date conversion
    */
    constructor(State) {
        super(State);
        this.State = State;

        // this.LANGUAGE_CODES = ['en', 'tr', 'zh', 'es', 'pt', 'hi', 'bn', 'ru', 'ja', 'fa', 'ar']
        this.supportedLanguages = this.State.Settings.localization.languages; // to be set in app.settings
        this.currentLanguage = this.State.Settings.localization.default; // to be set in app.settings
        this.Backend_NewTranslationPromises = [];
        this.waitForBackendToTranslationToFinish = false;
    }

    updateCurrentLanguage = (lang = null) => {
        this.currentLanguage = lang || this.State.Root.Services.Session.currentSessionSearchParams.get('language') ||
        this.State.Settings.localization.default ||
        //   this.getDefaultLanguageOfBrowser() || 
        window.localStorage.getItem('language');

        document.documentElement.setAttribute('lang', this.currentLanguage);
        window.localStorage.setItem('language', this.currentLanguage);
        this.State.Root.SessionHistory.Language = this.currentLanguage;
        return this.currentLanguage;
    }

    localAlign = (text, element) => {
        var farsi = /^[\u0600-\u06FF\s]+$/;
        if (farsi.test(text)) {
            element.setAttribute('direction', 'rtl !important');
            element.setAttribute('text-align', 'right');
        } else {
            element.setAttribute('direction', 'ltr !important');
            element.setAttribute('text-align', 'left');
        }
    }

    i18n = (text, lang = this.currentLanguage) => {
        return '<i18n lang="' + lang + '">' + text + '</i18n>';
    }
    getCurrentLangauge = () => {
        return this.currentLanguage;
    };

    translate = (el, text, lang) => {
        let self = this;
        var  hash_id = el.getAttribute('i18n-id');
        if (hash_id === null || hash_id === undefined) {
            hash_id = this.State.Root.Services.Data.Cache.hash(text);
            el.setAttribute('i18n-id', hash_id);
        }

        // TODO: Implement it at API level with cache: {'from': 'idb'/'ls'} // Async routine cache update on each App Load
        // Cache Table to keep track of keys and UTS, CTS
        
        // console.log('Localization for hash_id: ', hash_id);
        return this.State.Root.Services.Data.DB.Tables.Localization.then(
            db => {
                return db.getFromIndex('Localization', 'id', hash_id).then(
                    localization => {
                        // console.log('Localization getFromIndex', localization);
                        if (localization === undefined) {
                            let payload = { 'text': text, 'lang': lang, 'hash_id': hash_id };
                            // console.log('Call Backend for Localization.')

                            return this.State.Root.Services.Data.API.Post(this.State.Routes.API.service_localization, payload, {}
                                ).then(
                                    localization => {
                                        // console.log('Localization .API.Post', localization);
                                        let localizationObj = localization;
                                        // console.log('Adding to IndexedDB', localization.id)
                                        return this.State.Root.Services.Data.DB.Tables.Localization.then(db => {
                                            
                                            return db.add('Localization', {'id': localizationObj.id, 'localizations': localizationObj.localizations}).then(
                                                localization => {
                                                    // console.log('Localization .DB.Tables.Localization', localization);
                                                    return {'hash_id': hash_id, 'localization': localizationObj.localizations[this.currentLanguage]}
                                                }
                                            );
                                        });

                                    }
                                );
                        } else {

                            // console.log('result from IndexedDB', localization.localizations);
                            return {'hash_id': hash_id, 'localization': localization.localizations[this.currentLanguage]}

                        }
                    }
                );
        });
    }

    getDefaultLanguageOfBrowser = () => {
        var default_lan = navigator.language || navigator.userLanguage;
        if (default_lan !== '' && default_lan) {
            return default_lan.split('-')[0];
        } else {
            return this.State.Settings.localization.default;
        }
    }

    createLanguageSelection = () => {
        let that = this;
        var languages = document.getElementById('languages');
        languages.innerHTML = '';
        for (const [lanCode, language] of Object.entries(this.supportedLanguages)) {
            let ddItem = document.createElement('li');
            var lanNode = document.createElement('a');
            lanNode.setAttribute('class', 'dropdown-item languages');
            lanNode.setAttribute('dir', 'ltr');
            lanNode.setAttribute('lang', 'en');
            lanNode.setAttribute('id', lanCode);
            lanNode.innerHTML = [language.name, language.flag].join(' ');
            ddItem.appendChild(lanNode);
            languages.appendChild(ddItem);
            ddItem.addEventListener('click', function () {
                console.log('Changing Language To: ', lanCode);
                that.currentLanguage = that.updateCurrentLanguage(lanCode);
                that.setup();
            });
        }
    }

    setupLanguageNavbarSelection = () => {
        let langObj = this.supportedLanguages[this.currentLanguage];
        document.getElementById('language-dropdown').innerHTML = langObj.flag + ' ' + langObj.name;
    }

    setup = () => {
        this.updateCurrentLanguage();
        console.log('Translating Web APP Initiated for ', this.currentLanguage);
        this.createLanguageSelection();
        this.setupLanguageNavbarSelection();
        this.initiateTranslation();
        // this.applyManualTranslationEvent();
        return true;
    }

    disable = () => {
        if (document.getElementById('lang-menu')){
            document.getElementById('lang-menu').parentNode.removeChild(document.getElementById('lang-menu'));
        }
    }

    initiateTranslation = () => {
        this.applyTextTranslation();
        this.applyAttributesTextTranslation();
        if (this.Backend_NewTranslationPromises.length > 0) {
            // this.State.Root.Services.Component.toast('Translating new data.');
            this.waitForBackendToTranslationToFinish = true;
            Promise.all(this.Backend_NewTranslationPromises).then(results => {
                // console.log(results);
                for (let localization of results){
                    let elements = document.querySelectorAll('[i18n-id="' + localization.hash_id + '"]')
                    for (let el of elements){
                        if (el.hasAttribute('i18n-attrs')){ // TODO: for multi attribute objects set multiple hash id for each
                            const attrs = el.getAttribute('i18n-attrs').split(',');
                            attrs.forEach(attr => {
                                el.setAttribute(attr, localization.localization);
                            });
                        } else {
                            el.innerHTML = localization.localization;
                        }
                        el.setAttribute('lang', this.currentLanguage);
                        if (this.currentLanguage === 'fa'){
                            el.setAttribute('dir', 'rtl');
                            el.parentNode.setAttribute('dir', 'rtl');
                        } else {
                            el.setAttribute('dir', 'ltr');
                            el.parentNode.setAttribute('dir', 'ltr');
                        }
                        // console.log(el.innerHTML, localization)
                    }
                    // console.log(JSON.stringify({'hash_id': el.getAttribute('i18n-id'), 'lang': this.currentLanguage, 'text': localization.localization})); // TO UPDATE FROM CONSOLE
                    // window.Tajiran.State.Root.Services.Data.API.Post(window.Tajiran.State.Root.Routes.API.service_localization_update, 
                    //     {"hash_id":"10855105","lang":"fa","text":"شبکه اطلاعت"}
                    //     , {});
                }
                console.log('Finished Translating Site for Language:', this.getCurrentLangauge(), results.length, 'items.');
                // this.State.Root.Services.Component.toast([
                //     'Finished Translating Site for Language:', this.getCurrentLangauge(), results.length, 'items.'
                // ].join(' '));
                results = [];
                this.Backend_NewTranslationPromises = [];
            });
        }
    }

    applyDateTranslation = () => {
        console.log('Translating Jalali Dates to Gregorian...');
        for (let el of document.querySelectorAll('.has_date__jalali')) {
            el.innerText = this.applyDateConversion(el);
            el.classList.add('i18n_ignore_backend_translation');
        }
    }

    // isNotValidForTranslation = (el) => {
    //     let text = el.innerText;
    //     let language = el.getAttribute('lang');
    //     if (
    //         text === '' ||
    //         text.length === 0 ||
    //         language === undefined ||
    //         language == null ||
    //         this.LANGUAGE_CODES.indexOf(language) === -1
    //     ) {
    //         if (this.State.Settings.debug) {
    //             console.log('Invalid For Translation', el, language, el.innerText);
    //         }
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    applyTextTranslation = () => {
        for (let el of document.querySelectorAll('i18n')) {
            // if (this.isNotValidForTranslation(el)) {
            //     continue;
            // }
            let text = el.innerText;
            let language = el.getAttribute('lang');
            this.Backend_NewTranslationPromises.push(
                this.translate(el, text, language)
            );
        }
    }

    applyAttributesTextTranslation = () => { // TODO: fix the attribute translation
        for (let el of document.querySelectorAll('[i18n-attrs]')) {
            const attrs = el.getAttribute('i18n-attrs').split(',');
            const language = el.getAttribute('lang');
            attrs.forEach((attr) => {
                const text = el.getAttribute(attr);
                el.setAttribute('lang', this.currentLanguage);
                this.Backend_NewTranslationPromises.push(
                    this.translate(el, text, language)
                );
            });
        }
    }

    applyDateConversion = (tag) => {
        let dateObj = this.extractJalaliDateFromStringToGeorgian(tag.innerHTML);
        if (dateObj.jalaliDate !== null) {
            tag.innerText = tag.innerText.replace(dateObj.originalDate, dateObj.georgianDate);
            return tag.innerText;
        } else {
            return tag.innerText;
        }
    }

}



