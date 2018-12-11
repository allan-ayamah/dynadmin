import {get, set} from '../common/helpers'

export default class Data {
    constructor(data) {
        this.data = Object.assign({}, data);
    }

        /**
     * function that inserts an object into the given path
     * @param {String} id     -path where the object will be save
     * @param {Object} data 
     */
    set = (id, data) => {
        return set(this._data, id, data);
    }

    /**
     * function to access a specific data saved in the model
     * @param {String} dataPath - data key to access the object 
     * @returns{Object} - json object describng the unit/service  
     */
    get = (dataPath) => {
        return get(this._data, dataPath) 
    }

    has = (dataPath) => {
        return this.get(dataPath) ? true : false;
    }

    get js() {
        return this._data
    }

    get json() {
        return this._data
    }
    set data(data) { this._data = data;}
    get data() { return this._data }
}