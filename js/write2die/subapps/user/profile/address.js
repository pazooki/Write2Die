 

class Address {
    constructor(){
        this.isInvalid = false;
        this.fields = [
            'adress-fullname', 'adress-phone', 'adress-street', 'adress-city', 'adress-state', 'adress-postal-code', 'adress-country'
        ];
    }

    update = () => {
      this.data = {
          'fullname': document.getElementById('address-fullname').value || null,
          'phone': document.getElementById('address-phone').value || null,
          'country': document.getElementById('address-country').value || null,
          'region': document.getElementById('address-region').value || null,
          'city': document.getElementById('address-city').value || null,
          'street': document.getElementById('address-street').value || null,
          'postal_code': document.getElementById('address-postal-code').value || null
      }
    }

    validate = () => {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')
        // Loop over them and prevent submission
        Array.prototype.slice.call(forms).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    this.isInvalid = true;
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated')
            }, false)
        });
        return !this.isInvalid;
    }
    

    save = () => {
        console.log('Validating form...');
        this.validate();
        console.log('Updating data...');
        this.update();
        
        API.Post(API.Router.api__user_address, this.data, {}).then(data => {
            alert(data);
        });
    }

    getUserAddressIfAvailable(){
        API.Post(API.Router.api__user_address, this.data, {}).then(data => {
            alert(data);
            // for (i = 0; i < formItems.length; i++) {
            //     var item = formItems[i];
            //     document.getElementById(item).value = data[item];
            // }
            // crossCheck('btn-step-address', 'tab-address-icon', 'check');
        });
    }

    postAddress(payload){
        return API.Post(API.Router.api__user_address, payload, {}).then(data => {
            PageLoader.HTML.toast(data.msg)
        });
    }

    getAddress(){
        return API.Post(API.Router.api__user_address, {'action': 'get'}, {}).then(data => {
            PageLoader.HTML.toast(data.msg);
        });
    }

    addressSave(){
        notify(reset=true);
        let payload = {};
        payload['action'] = 'post';
        payload['data'] = {};
        var formItems = getAddressFieldNames();
        for (i = 0; i < formItems.length; i++) {
            var item = formItems[i];
            payload['data'][item] = document.getElementById(item).value;
        }
        postAddress(payload);
    }

    setupAddressTab(){
        // Setup Address Field Events & Data
        var selectedCountry = {};
        $.getJSON('/js/global/data/countries.json', function(countriesDataList) {
            $.getJSON('/js/global/data/countries-flag.json', function(countriesFlagDataDict) {
                countriesDataList.forEach(function(country){
                    var countryOption = document.createElement('option');
                    countryOption.setAttribute('value', country.countryName);
                    countryOption.innerHTML = countriesFlagDataDict[country.countryShortCode].emoji + ' ' + country.countryName;
                    document.getElementById('countryOptions').appendChild(countryOption);
                    
                    selectedCountry[country.countryName] = {
                        'regions': country.regions.map(function(region){return region.name;}),
                        'flag': countriesFlagDataDict[country.countryShortCode].emoji,
                        'shortCode': country.countryShortCode
                    }
                });
            });
        });
        $("#address-country").on('input', function () {
            var countryName = this.value;
            if($('#countryOptions option').filter(function(){return this.value.toUpperCase() === countryName.toUpperCase();}).length) {
                document.getElementById('address-country-flag').innerHTML = selectedCountry[countryName].flag;
                selectedCountry[countryName].regions.forEach(function(regionName){
                    var regionOption = document.createElement('option');
                    regionOption.setAttribute('value', regionName);
                    regionOption.innerHTML = regionName;
                    document.getElementById('regionOptions').appendChild(regionOption);
                });
            }
        });
    }
}

export default {
    Address
}