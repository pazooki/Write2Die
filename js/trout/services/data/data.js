import { DB } from './db.js';
import { Cache } from './cache.js';
import { API } from './api.js';
import { Cookies } from './cookies.js';

export class Data {
    constructor(State){
        this.Cache = new Cache(State);
        this.Cookies = new Cookies();
        this.API = new API(State, this.Cookies);
        this.DB = new DB();
    }
}