import { Address } from './address.js';
// import { GovDocuments } from './gov-documents.js';
// import { Agreement } from './agreement.js';

function setupEvents(){
    // document.getElementById('btn-step-address').addEventListener('click', function(event){changeToTab(event, 'step-address')});
    // document.getElementById('btn-step-gov-id').addEventListener('click', function(event){changeToTab(event, 'step-gov-id')});
    // document.getElementById('btn-step-legals').addEventListener('click', function(event){changeToTab(event, 'step-legals')});
    // document.getElementById('btn-step-address').click();
    // document.getElementById('address-step-save-btn').addEventListener('click', addressSave);
    // var govIdFilesEl = document.querySelector('[id="gov-id-files-btn"]');
    // govIdFilesEl.onchange = function(event) {
    //     govIdSave(govIdFilesEl.files);
    // }
    // document.getElementById('contract-1-signature-btn').addEventListener('click', postSignedContract);
}


$(document).ready(function() {
    var address = new Address();
    address.getUserAddressIfAvailable();
    // document.getElementById('address-form').onsubmit = function(event){
    //     event.preventDefault();
    //     if (!address.validate()){
    //         document.getElementById('address-form').checkValidity();
    //         document.getElementById('address-form').reportValidity();
    //     }
    //     return false;
    // };
    // getGovId();
    // getContract();
    setupEvents();
});
