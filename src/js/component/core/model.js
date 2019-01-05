import DynAdminService, { ADMIN_LOG_TYPE } from "js/common/dynadmin-service";
import ComponentHelper from './component-helper';
import { _cloneDeep, _get, _set, _has } from "js/common/utils"

export default class Model extends DynAdminService {
    constructor(id, data, mgr) {
        super(mgr);
        this.id = id;
        if(data[id] === undefined || data[id] === null) {
            this._data =  Object.assign({}, { 
                [id]: data 
            })
        } else{
            this._data = data;
        } 
        this.componentHelpers = new Map();   
    }

    static fromJson(mgr, json) {
        const data = JSON.parse(json);
        const keys = Object.keys(data);
        if(keys.length == 0 || keys.length > 1){
            console.log(`Invalid model`);
            throw new Error(`could invalid model`);
        }
        const id = keys[0];
        return new Model(id, data, mgr)
    }

    getComponent(fullId) {
        return this.get(fullId);
    }

    getComponentHelper(fullId) {
        const id = fullId;
        let helper = this.componentHelpers.get(id); 
        if(helper === undefined || helper == null) {
            const component = this.getComponent(fullId);
            const config = this.mgr.getConfigByName(component.meta.configName);
            helper = new ComponentHelper(this, fullId, config);
            this.componentHelpers.set(id, helper);
        }
        return helper;
    }

    getParentId(id) {
        this.mgr.parentIdOf(this, id);
    }


    getData() {
        return this.get(this.id);
    }

    copy(dataPath) {
        const actual = this.get(dataPath);
        return _cloneDeep(actual)
    }


    /* function that inserts an object into the given path
    * @param {String} id     -path where the object will be save
    * @param {Object} data 
    */
   set = (id, data) => {
       return _set(this._data, id, data);
   }

   /**
    * function to access a specific data saved in the model
    * @param {String} dataPath - data key to access the object 
    * @returns{Object} - json object describng the unit/service  
    */
   get = (dataPath) => {
       return _get(this._data, dataPath) 
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
