export class Utils {
    constructor(State){
        this.State = State;
    }

    static debounce = (func, timeout = 300) => {
        let timer;
        console.log('Utils.debounce is called.')
        return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => { func.apply(this, args); }, timeout);
          console.log('Utils.debounce.return:', timer);
        };
    }
}