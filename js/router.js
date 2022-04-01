class Router {

    constructor(host, AppPathName){
        this.host = host;
        this.AppPathName = AppPathName;
    }

    server = (route) => {
        return this.host + route;
    }

    get policies() {
        return {
            Time: {
                RESET: 1,
                ZERO: 0, // ZERO-CACHE-POLICY
                Second: 1000,
                Minute: 1000 * 60,
                Hour: (1000 * 60) * 60,
                Day: ((1000 * 60) * 60) * 24,
                Month: (((1000 * 60) * 60) * 24) * 30,
                Year: (((((1000 * 60) * 60) * 24) * 30) * 12),
                //          1 Minute     1Hr  1Day 1Month 1Year
            },
            Compression: {
                SizeLargerThanBytes: 128, // Bytes
            }
        }
    }

    get Routes(){
        return {
            Site: { route: this.host, cache: { validityTime: this.policies.Time.ZERO } },
            Meta: [
                // HTML

                // desktop
                { route: '/html/trout/index/index.desktop.html', device: 'desktop', attributes: { placementTag: 'main' }, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/html/trout/index/menu.desktop.html', device: 'desktop', attributes: { placementTag: 'menu-desktop' }, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/html/trout/index/footer.desktop.html', device: 'desktop', attributes: { placementTag: 'footer-desktop' }, cache: { validityTime: this.policies.Time.ZERO } },

                // mobile
                { route: '/html/trout/index/index.mobile.html', device: 'mobile', attributes: { placementTag: 'main' }, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/html/trout/index/menu.mobile.html', device: 'mobile', attributes: { placementTag: 'menu-mobile' }, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/html/trout/index/footer.mobile.html', device: 'mobile', attributes: { placementTag: 'footer-mobile' }, cache: { validityTime: this.policies.Time.ZERO } },

                // SCRIPT
                { route: '/js/trout/thirdparty-libs/bootstrap.bundle.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                // { route: '/js/trout/thirdparty-libs/masonry.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/js/trout/thirdparty-libs/simplebar.js', cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/js/trout/thirdparty-libs/flatpickr.js', cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/js/trout/thirdparty-libs/theme.js', cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/js/trout/thirdparty-libs/jquery-ui.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/js/trout/thirdparty-libs/jquery.timeago.js', cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/js/trout/thirdparty-libs/jquery-editable-select.min.js', cache: { validityTime: this.policies.Time.ZERO } },

                // STYLESHEET
                { route: '/css/trout/thirdparty-libs/simplebar.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/flatpickr.min.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/bootstrap.min.css', cache: { validityTime: this.policies.Time.ZERO } }, // import directly in trout.css condition on LTR lang
                // { route: '/css/trout/thirdparty-libs/bootstrap.rtl.min.css', attributes: {charset: "utf-8"}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/jquery-ui.min.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/jquery-ui.theme.min.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/jquery-ui.structure.min.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/jquery-editable-select.min.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
                { route: '/css/trout/thirdparty-libs/bootstrap-icons/bootstrap-icons.css', attributes: {}, cache: { validityTime: this.policies.Time.ZERO } },
            ],

            API: {
                // My Portfolio
                // -- Trade
                trade_order: { route: this.server('/api/user/order/'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                trade_credit: { route: this.server('/api/user/credit/'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },

                // User
                signup: { route: this.server('/api/signup/'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                auth: { route: this.server('/api/auth/'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                user: { route: this.server('/api/user/'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                
                articles_action: { route: this.server('/api/content/articles/'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },

                // Services
                service_cache: { route: this.server('/api/services/cache'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_localization_update: { route: this.server('/api/services/localization/update'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_localization: { route: this.server('/api/services/localization'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_subscription: { route: this.server('/api/services/subscription/'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                service_messaging_notification: { route: this.server('/api/services/messaging/notification'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                service_messaging_chat: { route: this.server('/api/services/messaging/chat'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                service_tracking: { route: this.server('/api/services/tracking'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_logback: { route: this.server('/api/services/logback'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_ping: { route: this.server('/api/services/ping'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },

                // Symbol Profile
                service_company_profile: { route: this.server('/api/services/company/profile/'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_company_profile_mini: { route: this.server('/api/services/company/profile/mini/'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                service_company_documents: { route: this.server('/api/services/company/documents/'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },

                // Overview
                market_map_data: { route: this.server('/api/market/overview/marketmap'), auth: false, cache: { validityTime: this.policies.Time.Day } },
                market_map_data_by_industry: { route: this.server('/api/market/overview/marketmap/industry'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },

                // Cloud
                cloud_schema_service: { route: this.server('/api/cloud/service/schema/'), auth: true, cache: { validityTime: this.policies.Time.Month } },
                cloud_data_query_companies: { route: this.server('/api/cloud/query/companies'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                cloud_data_query_market: { route: this.server('/api/cloud/query/market'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                cloud_data_schema_companies: { route: this.server('/api/cloud/schema/companies'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },
                cloud_data_schema_market: { route: this.server('/api/cloud/schema/market'), auth: true, cache: { validityTime: this.policies.Time.ZERO } },

                // ElasticSearch
                es__search_records: { route: this.server('/es/profile_index/_search?pretty=true'), auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                es__local__search_records: { route: 'http://localhost:9200/profile_index/_search?pretty=true', auth: false, cache: { validityTime: this.policies.Time.ZERO } },
            },
            Data: {
                translations: { route: '/static/data/translations.json', auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                countries: { route: '/static/data/countries.json', auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                countries_flag: { route: '/static/data/countries-flag.json', auth: false, cache: { validityTime: this.policies.Time.ZERO } },
                timezones: { route: '/static/data/timezones.json', auth: false, cache: { validityTime: this.policies.Time.ZERO } },
            },
            // Components
            Components: {
                modal: { route: '/html/trout/index/components/modal.html', auth: false, cache: { validityTime: this.policies.Time.Month } }
            },

            ThirdPartyModuleResources: {
                ApexCharts: [
                    { route: '/js/trout/thirdparty-libs/apexcharts.js', cache: { validityTime: this.policies.Time.ZERO } },
                ],
                PrettyPrintJson: [
                    { route: '/js/trout/thirdparty-libs/pretty-print-json.min.js', cache: { validityTime: this.policies.Time.Day } },
                    { route: '/css/trout/thirdparty-libs/pretty-print-json.css', cache: { validityTime: this.policies.Time.Day } },
                ],
                DataTables: [
                    { route: '/js/trout/thirdparty-libs/jquery.dataTables.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/datatables.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/dataTables.bootstrap5.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/searchBuilder.bootstrap5.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/dataTables.responsive.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/dataTables.rowReorder.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/dataTables.rowGroup.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/dataTables.dateTime.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/dataTables.searchBuilder.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/pdfmake.min.js', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/js/trout/thirdparty-libs/vfs_fonts.js', cache: { validityTime: this.policies.Time.ZERO } },

                    { route: '/css/trout/thirdparty-libs/responsive.bootstrap5.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/responsive.dataTables.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/jquery.dataTables.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/datatables.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/dataTables.bootstrap5.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/dataTables.dateTime.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/rowReorder.dataTables.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/rowGroup.dataTables.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                    { route: '/css/trout/thirdparty-libs/searchBuilder.dataTables.min.css', cache: { validityTime: this.policies.Time.ZERO } },
                ]
            },
        }
    }

    SubAppResources = (subAppPath, device) => { // removing trailing slash from subapppath
        return [
            { route: '/css/subapps' + subAppPath.replace(/\/$/, "") + '.' + device + '.css', cache: { validityTime: this.policies.Time.ZERO } },
            { route: '/html/subapps' + subAppPath.replace(/\/$/, "") + '.' + device + '.html', attributes: { placementTag: 'subapp' }, cache: { validityTime: this.policies.Time.ZERO } },
        ]
    }

    SubAppModule = (subAppPath, device) => {
        console.log('subAppPath: ', subAppPath, device, '/js/' + this.AppPathName + '/subapps' + subAppPath.replace(/\/$/, "") + '.' + device + '.js');
        return { route: '/js/' + this.AppPathName + '/subapps' + subAppPath.replace(/\/$/, "") + '.' + device + '.js', cache: { validityTime: this.policies.Time.ZERO } }
    }
}

export {
    Router
}