export class Network{
    constructor(State){
        this.State = State;
    }

    ping = (resource, log = false, interval = 500) => {
        setInterval(function () {
            this.State.Root.Services.Data.API.Get(resource, { urlParams: { 'ping_ts': Date.now() } }).then(pong => {
                if (log) {
                    console.log(pong);
                }
            })
        }, interval);
    }

    log = ({page=null, data=null, stacktrace=null, is_mobile=false}) => {
        let payload = {
            data: data,
            stacktrace: stacktrace,
            user_agent: wiindow.navigator.userAgent,
            page: page,
            is_mobile: is_mobile,
            ip_address: 'TO_BE_SET_BY_SERVER',
            received_ts: 'TO_BE_SET_BY_SERVER',
            ts: Date.now()
        }
        this.State.Root.Services.Data.API.Post(this.State.Routes.service_logback, payload, {})
    }

}