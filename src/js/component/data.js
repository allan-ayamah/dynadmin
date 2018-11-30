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
        if(dataPath === this.id)
            return this.data;  
        return get(this._data, dataPath) 
    }

    has = (dataPath) => {
        return this.get(dataPath) ? true : false;
    }

     /**
     * Finds the parent data given childs id
     * @param {String} _id -The child id
     */
    parent(someId) {
        const data = this._data;
        if(someId === data.id) {
            return data;
        }
        const parts = someId.split('.');
        // unit is the last part of the data key
        let assignedId = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const parentId = someId.split(`.${assignedId}`)[0];
        return get(data, parentId)
    }

    get js() {
        return this._data
    }

    get json() {
        return this._data
    }

    set data(data) { this._data = data; console.log("SETDA")}
    
    get data() { return this._data }

    get id() { return this._data.id }

    get name() { return this._data.name } 
}