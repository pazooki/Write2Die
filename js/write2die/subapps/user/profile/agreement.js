import { contract_url } from '../../global/libs/urls.js';

class Agreement {
    getContract(){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", contract_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', getCookie('uuid'));
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.response);
                if (data.status){
                    document.getElementById('contract-1-text').value = data.contract;
                    document.getElementById('contract-1-signature-date').value = (new Date(data.ts)).toLocaleString() || (new Date()).toLocaleString();
                    document.getElementById('contract-1-signature-fullname').value = data.fullname;
                    document.getElementById('contract-1-signature-checked').checked = data.checked;
                    if (data.checked){
                        crossCheck('btn-step-legals', 'tab-legals-icon', 'check');
                        crossCheck('side-nav-legals', 'side-nav-legals-icon', 'check');
                    } else {
                        crossCheck('btn-step-legals', 'tab-legals-icon', 'x');
                        crossCheck('side-nav-legals', 'side-nav-legals-icon', 'x');
                    }
                }
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                notify('Getting Contract Data Failed', false);
                crossCheck('btn-step-legals', 'tab-legals-icon', 'x');
                crossCheck('side-nav-legals', 'side-nav-legals-icon', 'x');
            }
        }
        xhr.send(JSON.stringify({'action': 'get'}));
    }
    
    postSignedContract(){
        var xhr = new XMLHttpRequest();
        xhr.open("POST", contract_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', getCookie('uuid'));
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.response);
                console.log(data);
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                notify('Getting Contract Data Failed', false);
            }
        }
        var signature = {
            'text': document.getElementById('contract-1-text').value,
            'fullname': document.getElementById('contract-1-signature-fullname').value,
            'date': document.getElementById('contract-1-signature-date').value,
            'checked': document.getElementById('contract-1-signature-checked').value
        }
        xhr.send(JSON.stringify({'action': 'post', 'signature': signature}));
    }
}


export default {
    Agreement
}