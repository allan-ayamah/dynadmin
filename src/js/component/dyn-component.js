import Data from './data';
import { set, get } from '../common/helpers';

export default class DynComponent {
    constructor(data){
        this.mgr = mgr;
    }
    
    /**
     * function that inserts an object into the given path
     * @param {String} id     -path where the object will be save
     * @param {Object} data 
     */
    set = (id, data) => {
        return set(this.data, id, data);
    }
        /**
     * function to access a specific data saved in the model
     * @param {String} dataPath - data key to access the object 
     * @returns{Object} - json object describng the unit/service  
     */
    get = (dataPath) => { return get(this.data, dataPath) }

     /**
     * Finds the parent data given childs id
     * @param {String} _id -The child id
     */
    parent(_id) {
        const data = this.model;
        if(_id === data.id) {
            return data;
        }
        const parts = _id.split('.');
        // unit is the last part of the data key
        let assignedId = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const parentId = _id.split(`.${assignedId}`)[0].join();
        return h.get(data, parentId)
    }

    get js() {
        return this.data
    }

    get json() {
        return this.data
    }

    get data() { this.data }

    get dataKey() { this.data.id }

    get name() { this.data.name } 
}