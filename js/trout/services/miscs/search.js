export class Search {
    constructor(State) {
        this.State = State;
    }

    setupSearchAutoComplete = (dataListOptionsId='searchDataListOptions', searchDataListId='searchDataList') => {
        // TODO: Make a search page that lists companies with all their attribute in a table to choose from
        let that = this;
        if (document.getElementById(searchDataListId) === null) {
            return;
        }
        document.getElementById(searchDataListId).addEventListener('input', function(event){
            that.State.Root.Services.Localization.localAlign(this.value, document.getElementById(searchDataListId));
            if (this.value.length == 12 && this.value.startsWith('IR')) {
                that.State.Root.Services.Session.route({subAppName: '/market/company-profile/?data=' + this.value})
            } else {
                var searchDataOptionsList = document.getElementById(dataListOptionsId);
                var query = {"query" : {"query_string": {"query": '*' + document.getElementById(searchDataListId).value + '*'}}}
                that.State.Root.Services.Data.API.Post(that.State.Root.Routes.API.es__search_records, query, {}).then((data) => {
                    that.populateDataOptionsList(data, searchDataOptionsList);
                });
            }
        });
    }

    populateDataOptionsList = (data, searchDataOptionsList) => {
        searchDataOptionsList.innerHTML = '';
        data.hits.hits.map(function(hit){return hit._source}).forEach(function(symbol){
            var option = document.createElement("option");
            for (let sindex of [
                symbol.ISIN + ':' + symbol.company_name + ':' + symbol.company_name_en, 
                // symbol.symbol_en, 
                // symbol.company_name, 
                // symbol.company_name_en,
                // symbol.instrument_code,
                // symbol.CISIN,
                // symbol.subindustry + ' - ' + symbol.symbol_en,
                // symbol.industry + ' - ' + symbol.symbol_en
            ]){
                option.setAttribute('value', symbol.ISIN);
                option.innerHTML = sindex;
                searchDataOptionsList.appendChild(option);
            }
        });
    }
}