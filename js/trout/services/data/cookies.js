export class Cookies{
    static HOURS = (24 * 60 * 60 * 1000);

    constructor() {
        this.uuid = this.getCookie('uuid');
    }

    getCookie = (key) => {
        return document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)')?.pop() || '';
    }

    setCookie = (name, value, days = 3600) => {
        var expires = "";
        if (days) {
            date.setTime(this.getCookiesExpirationTime(days));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    getCookiesExpirationTime = (days) => {
        var date = new Date();
        return date.getTime() + (Cookies.HOURS * days);
    }

    getUserUUID = () => {
        if (this.getCookie('uuid') !== null && this.getCookie('uuid') !== '') {
            return this.getCookie('uuid');
        } else {
            return null;
        }
    }

    makeUUID = () => {
        //// return uuid of form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        var uuid = '', ii;
        for (ii = 0; ii < 32; ii += 1) {
          switch (ii) {
          case 8:
          case 20:
            uuid += '-';
            uuid += (Math.random() * 16 | 0).toString(16);
            break;
          case 12:
            uuid += '-';
            uuid += '4';
            break;
          case 16:
            uuid += '-';
            uuid += (Math.random() * 4 | 8).toString(16);
            break;
          default:
            uuid += (Math.random() * 16 | 0).toString(16);
          }
        }
        return uuid;
    }
}








