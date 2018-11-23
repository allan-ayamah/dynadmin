import Data from '../data';
import { 
    DEFAULT_COMPONENTS_CONFIG, 
    MODEL_CONFIG_NAME, 
    PAGE_CONFIG_NAME 
} from './default-config';

import {clone} from '../../common/helpers';

const DEFAULT_MANAGER_CONFIG = {
    
}

export class DynManager {
    constructor() {
        this.componentConfigs = {}
        this.registerConfigs(DEFAULT_COMPONENTS_CONFIG);
        this.config = DEFAULT_MANAGER_CONFIG;
    }
    
    /**
     * 
     * @param {number} id - The id to assign to the model 
     * @param {String} name - The name of the model
     * @returns {DynModel/DynComponent} - The new create model
     */
    createModel(id, name) {
        if(id === undefined) {
            throw new Error(`Model id cannot be null`);
        }
        let modelId =  new String(id);
        if(!modelId.startsWith(MODEL_CONFIG_NAME)){
            modelId = `${MODEL_CONFIG_NAME}${modelId}`;
        }
        const modelData = this.initData(modelId, name, this.getConfigByName(MODEL_CONFIG_NAME));
        const model = new Data(modelData)
        //Create default page
        this.createElement(model, model.id, PAGE_CONFIG_NAME);
        return model;
    }

    /**
     * Function to get component configuration
     * @param {String} name     unique name of the component config
     * @returns {JSON/Object}   the config object
     */
    getConfigByName(name) {
        return this.componentConfigs[name];
    }

    /**
     * This function registers a new component configuration
     * if the configuration has already been registered @param {overrideAlways}
     * is "true" then new config whll override the old
     * @param {Array/Object} newConfig 
     * @param {Boolean} [overrideAlways=true]
     */
    registerConfigs(newConfig, overrideAlways=true) {
        const configArr = Array.isArray(newConfig) ? newConfig : [newConfig];
        configArr.forEach(configItem => {
            const name = configItem.meta.id;
            if(this.getConfigByName(name)) {
                if(!overrideAlways) return;
                delete this.componentConfigs[name];
                this.componentConfigs[name] = Object.assign({}, configItem);
            } else {
                this.componentConfigs[name] = Object.assign({}, configItem);
            }
        })

        // register default menut items
        Object.keys(this.componentConfigs).forEach(configName => {
            const config = this.componentConfigs[configName];
            const defaultAddElements = config.elements;
            const menuItems = [];
            if(defaultAddElements) {
                //console.log(defaultAddElements)
                defaultAddElements.forEach(el => {
                    const elConfig = this.componentConfigs[el]
                    if(elConfig === undefined){
                        const error = new Error(`Component configuration not found for name ${el}`);
                        console.error(error);
                        return;
                    }
                    const menuItem = {
                        name: elConfig.meta.label,
                        componentId:  elConfig.meta.id,
                        action: 'add',
                        group: 'add',
                    }
                    menuItems.push(menuItem);
                });
            }
            this.componentConfigs[configName].menuItems = menuItems;
            ///console.log(this.componentConfigs[configName].menuItems)
        })  
    }



    /**
     * Function creates a new component data and appends 
     * it to it's parent
     * @param {String} configName   - name of the class
     * * @param {String} parentId  - id of the parent data
     * @returns {Object}
     */
    createElement(model, parentId, configName) {
        if(!parentId) {
            throw new Error(`Invalid parent id ${parentId}`);
        }
        const isParentRoot = parentId === model.id;
        if(!isParentRoot && (model.get(parentId) === undefined)) {
            throw new Error(`Data can not be found for parent id: ${parentId}`);
        }
        const nextValPath = `meta.${configName}.nextValue`;
        let nextVal = model.get(nextValPath);
        if(nextVal === undefined) {
            console.log(`INIT interval for ${configName}`)
            nextVal = 1;
        }
        //update component nextValue
        model.set(nextValPath, nextVal + 1)
        
        const compConf = this.getConfigByName(configName);
        if(!compConf) {
            throw new Error(`Element config not found for [${configName}]`) 
        }
        const compMeta = compConf.meta;
        let assignedId =  `${parentId}.${compMeta.id}${nextVal}`;
        if(isParentRoot) {
            assignedId = `${compMeta.id}${nextVal}`;
        }
        const defaultName = `${compMeta.namePrefix}${nextVal}`;
        const data = this.initData(assignedId, defaultName, compConf);
        model.set(data.id, data);
        return model.get(assignedId);
    }

    /**
     * Function to instantiate a component from a general configuration
     * @param {String} id       id assign to the component
     * @param {String} name     default component name
     * @param {Object} config   descriptor of component properties
     * @param {Function/Class} componentClass - callback function to recieves 4 parameters
     *                                          after data is initialized
     * @returns {Data}
     */
    initData(id, name, config) {
        let data = {};
        Object.keys(config.properties).forEach( propName => {
            data[propName] = undefined;
        })
        data.id = id;
        data.name = name;
        data.meta = {
            componentId: config.meta.id,
        }
        return data;
    }

    findElements(data, callbackfn) {
        let cb;
        if(callbackfn) {
            cb = callbackfn;
        } else {
            // call back to return all elements
            cb = () => true;
        }
        const configName = data.meta.componentId;
        const componentProps = Object.keys(this.getConfigByName(configName).properties)
        componentProps.push('id', 'meta')
        return Object.keys(data)
        .filter(key => !componentProps.includes(key))
        .map(compKey => {
             if (cb(data[compKey])) {
                return data[compKey];
             }
        });
    }

    isElementViewOnly(data) {
        const configName = data.meta.componentId;
        return this.getConfigByName(configName).meta.viewOnly
    }

    isElementViewOperation(data) {
        const configName = data.meta.componentId;
        return this.getConfigByName(configName).meta.viewOperation
    }

    isElementOperationOnly(data) {
        const configName = data.meta.componentId;
        return this.getConfigByName(configName).meta.operationOnly
    }


    elementMenuItems(element) {
        const configName = element.meta.componentId;
        return clone(this.getConfigByName(configName).menuItems);
    }
}

export default DynManager;