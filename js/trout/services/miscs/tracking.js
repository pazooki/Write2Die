export class Tracker {
    constructor(State) {
        this.State = State

        this.config = {
            userInfo: true,
            clicks: true,
            mouseMovement: true,
            mouseMovementInterval: 1,
            mouseScroll: true,
            mousePageChange: true, //todo
            timeCount: true,
            clearAfterProcess: true, // todo
            processTime: 3, // Every N seconds
            backend: true

        }

        this.results = {
            userInfo: {
                appCodeName: navigator.appCodeName || '',
                appName: navigator.appName || '',
                vendor: navigator.vendor || '',
                platform: navigator.platform || '',
                userAgent: navigator.userAgent || ''
            },
            sessions: [],
            time: {
                startTime: 0,
                sendTime: 0,
            },
            clicks: {
                clickCount: 0,
                clickDetails: []
            },
            mouseMovements: [],
            mouseScroll: [],
            contextChange: [], //todo
            //keyLogger: [], //todo
        }
        self = this;
    }
    processData = (results) => {
        if (results){
            results.time.sendTime = Date.now();
            this.State.Root.Services.Data.API.Post(this.State.Routes.API.service_tracking, results, {debug: false}).then(data => {
                this.resetResults();
            }).catch((error) => {
                // console.log(results, error);
                this.resetResults();
            });
        }
    }
    mem = {
        processInterval: null,
        mouseInterval: null,
        mousePosition: [], //x,y,timestamp
        eventListeners: {
            scroll: null,
            click: null,
            mouseMovement: null,
        },
        eventsFunctions: {
            scroll: () => {
                self.results.mouseScroll.push([window.scrollX, window.scrollY, Date.now()]);
            },
            click: (e) => {
                self.results.clicks.clickCount++;
                self.results.clicks.clickDetails.push([e.clientX, e.clientY, e.target, Date.now()]);
            },
            mouseMovement: (e) => {
                self.mem.mousePosition = [e.clientX, e.clientY, Date.now()];
            }
        }
    }

    resetResults = () => {
        this.results = {
            userInfo: {
                appCodeName: navigator.appCodeName || '',
                appName: navigator.appName || '',
                vendor: navigator.vendor || '',
                platform: navigator.platform || '',
                userAgent: navigator.userAgent || ''
            },
            sessions: [],
            time: {
                startTime: 0,
                sentTime: 0,
            },
            clicks: {
                clickCount: 0,
                clickDetails: []
            },
            mouseMovements: [],
            mouseScroll: [],
            contextChange: [], //todo
            //keyLogger: [], //todo
        }
    }

    start = () => {

        if (Object.keys(this.config).length !== Object.keys(this.config).length) {
            console.log("no config provided. using default..");
            this.config = this.config;
        }
        // TIME SET
        if (this.config.timeCount !== undefined && this.config.timeCount) {
            this.results.time.startTime = Date.now();
        }
        // MOUSE MOVEMENTS
        if (this.config.mouseMovement) {
            this.mem.eventListeners.mouseMovement = window.addEventListener("mousemove", this.mem.eventsFunctions.mouseMovement);
            this.mem.mouseInterval = setInterval(() => {
                if (this.mem.mousePosition && this.mem.mousePosition.length) { //if data has been captured
                    if (!this.results.mouseMovements.length || ((this.mem.mousePosition[0] !== this.results.mouseMovements[this.results.mouseMovements.length - 1][0]) && (this.mem.mousePosition[1] !== this.results.mouseMovements[this.results.mouseMovements.length - 1][1]))) {
                        this.results.mouseMovements.push(this.mem.mousePosition)
                    }
                }
            }, this.config.mouseMovementInterval * 1000);
        }
        //CLICKS
        if (this.config.clicks) {
            this.mem.eventListeners.click = window.addEventListener("click", this.mem.eventsFunctions.click);
        }
        //SCROLL
        if (this.config.mouseScroll) {
            this.mem.eventListeners.scroll = window.addEventListener("scroll", this.mem.eventsFunctions.scroll);
        }
        //PROCESS INTERVAL
        if (this.config.processTime !== false && this.config.backend) {
            this.mem.processInterval = setInterval(() => {
                this.processResults();
            }, this.config.processTime * 1000)
        }
    }

    processResults = () => {
        if (this.config.clearAfterProcess) {
            for (let session of Object.values(this.State.Root.SessionHistory.Sessions)){
                if (session.TS >= this.results.time.startTime){
                    this.results.sessions.push(session);
                }
            }
        }
        this.processData(this.results);
        this.resetResults();
    }

    stop = () => {
        if (this.config.processTime !== false) {
            clearInterval(this.mem.processInterval);
        }
        clearInterval(this.mem.mouseInterval);
        window.removeEventListener("scroll", this.mem.eventsFunctions.scroll);
        window.removeEventListener("click", this.mem.eventsFunctions.click);
        window.removeEventListener("mousemove", this.mem.eventsFunctions.mouseMovement);
    }

    result = () => {
        if (this.config.timeCount !== undefined && this.config.timeCount) {
            this.results.time.currentTime = Date.now();
        }
        return this.results
    }
}
