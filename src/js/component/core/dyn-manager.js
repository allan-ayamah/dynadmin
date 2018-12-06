import Data from '../data';
import { 
    DEFAULT_COMPONENTS_CONFIG, 
    MODEL_CONFIG_NAME, 
    PAGE_CONFIG_NAME, 
    FLOW_CONFIG_NAME, 
} from './default-config';

import { clone } from '../../common/helpers';

const DEFAULT_MANAGER_CONFIG = {
    
}


const MIN_COMPONENT_WIDTH = 12;
export class DynManager {
    constructor(opts) {
        this.config = DEFAULT_MANAGER_CONFIG;
        let components = clone(DEFAULT_COMPONENTS_CONFIG);
        if(opts.components) {
            const userComponents = clone(opts.components);
            components.push(...userComponents);
        }
        this.componentConfigs = {}  
        this.registerConfigs(components);   
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
        const modelData = this.initData(modelId, modelId, name, this.getConfigByName(MODEL_CONFIG_NAME));
        const model = new Data(modelData)
        //Create default page
        this.createElement(model, model.id, PAGE_CONFIG_NAME);
        console.log("MODEL", clone(model.data))
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

    filterComponents(callback) {
        const componentNames = Object.keys(this.componentConfigs);
        componentNames.filter()
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

        // register
        const componentsName = Object.keys(this.componentConfigs);
        componentsName.forEach(configName => {
            const config = this.componentConfigs[configName];
            let defaultAddElements = [];
            
            // add flow
            if(config.meta.flowSource) {
                defaultAddElements.push(FLOW_CONFIG_NAME);
            }

            if(config.meta.elements) {
                defaultAddElements.push(...config.meta.elements)
            }

            config.menuItems = [];
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
                    config.menuItems.push(menuItem);
                });
            }

            // Components that can be placed in the current component
            let childComponents = []
            // Acceptes groups
            const acceptsGroups = config.meta.acceptsGroups;
            if(acceptsGroups) { 
                console.log(`AcceptsGroups for: ${configName}`)
                // console.log(acceptsGroups)       
                const componentsIncluded = componentsName.filter((cnfName) => {
                    const comp = this.componentConfigs[cnfName];
                    if(acceptsGroups.includes(comp.meta.group)) {
                        return cnfName;
                    }
                });
                childComponents.push(...componentsIncluded)
            }

            // View components
            if(configName === PAGE_CONFIG_NAME) {
                const viewOperationCompNames = componentsName.filter((cnfName) => {
                    const comp = this.componentConfigs[cnfName];
                    if(comp.meta.viewOnly || comp.meta.viewOperation) {
                        return cnfName;
                    }
                });
                childComponents.push(...viewOperationCompNames)
            }
            
            if(childComponents) {
                console.log(`Child components for ${configName}`)
                //console.log(childComponents)
                childComponents.forEach(cName => {
                    const elConfig = this.componentConfigs[cName]
                    if(elConfig){
                        config.menuItems.push({
                            name: elConfig.meta.label,
                            componentId:  elConfig.meta.id,
                            group: elConfig.meta.group,
                            action: 'add'
                        });
                    }
                });
            }
        }) 

       // console.log(this.componentConfigs)
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
            // console.log(`INIT interval for ${configName}`)
            nextVal = 1;
        }
        // update component nextValue
        model.set(nextValPath, nextVal + 1)
        
        const compConf = this.getConfigByName(configName);
        if(!compConf) {
            throw new Error(`Element config not found for [${configName}]`) 
        }
        const compMeta = compConf.meta;
        const localId = `${compMeta.id}${nextVal}`;
        let assignedId =  `${parentId}.${localId}`;
        if(isParentRoot) {
            assignedId = localId;
        }
        const defaultName = `${compMeta.namePrefix}${nextVal}`;
        const data = this.initData(assignedId, localId, defaultName, compConf);
        model.set(data.id, data);
        return model.get(assignedId);
    }

    getElementIO = (model, elementId) => {
        const element = model.get(elementId);
        const children = this.findElements(element)
        const componentConf = this.getConfigByName(element.meta.componentId);
        const inputGenerator = componentConf.input;
        let inputResult, outputResult;
        if(inputGenerator) {
            try {
                inputResult = inputGenerator(element, children, this);
            } catch (err) {
                console.error(`Error occured while generating input result for ${elementId}`, err);
            }
        }
        const outputGenerator = componentConf.output;
        if(outputGenerator) {
            try {
                outputResult = outputGenerator(element, children, this);
            } catch (err) {
                console.error(`Error occured while generating output result for ${elementId}`, err);
            }
        }
        return {
            input: inputResult || [],
            output: outputResult || []
        }
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
    initData(id, localId, name, config) {
        let data = {};
        Object.keys(config.properties).forEach( propName => {
            const prop = config.properties[propName];
            data[propName] = prop.default;
            // console.log(`${propName} : ${prop.default}`)
        })
        data.id = id;
        data.name = name;
        data.meta = {
            localId: localId,
            componentId: config.meta.id,
            top: 0,
            left: 0,
            minWidth: config.meta.minWidth
        }
        /*let width = config.meta.style && config.meta.style.minWidth;
        if(!width && (config.meta.viewOnly || config.meta.viewOperation)) {
            // width = MIN_COMPONENT_WIDTH;
        }*/
        return data;
    }


    parentIdOf = (model, childId) => {
        const data = model.data
        if(childId === data.id) return childId;
        const parts = childId.split('.');
        // unit is the last part of the data key
        const assignedId = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const parentId = childId.split(`.${assignedId}`)[0];
        console.log("resolve parent", parentId, parts, assignedId)
        return parentId;
    }

    
    getComponentPos(model, id) {
        const component = this.model.get(`${id}`);
        const { top, left } = component.meta;
        return {
            left: component.meta.left,
            top: component.meta.top,
        }
    }


    updateComponentPos(model, id, eventData) {
        model.set(`${id}.meta.left`, eventData.left);
        model.set(`${id}.meta.top`, eventData.top);
        model.set(`${id}.meta.minWidth`, eventData.minWidth);
        model.set(`${id}.meta.minHeight`, eventData.minHeight);
    }

    findElements(data, callback) {
        let cb;
        if(callback) {
            cb = callback;
        } else {
            cb = (d) => { return true }
        }
        const configName = data.meta.componentId;
        const propertyNames = Object.keys(this.getConfigByName(configName).properties)
        propertyNames.push('id', 'dataKey', 'meta', 'input', 'output')

        const foundKeys = [];
        let filteredKeys = Object.keys(data).filter(key => !propertyNames.includes(key));
        filteredKeys = filteredKeys.sort();
        filteredKeys.forEach(compKey => {
             if (cb(data[compKey])) {
                foundKeys.push(data[compKey]);
             }
        });

        return foundKeys;
    }

    /**
     * Returns true if the element can be placed on stage
     * @param {Element} element --the element
     */
    isStageElement(element) {
        const configName = element.meta.componentId;
        const compConfigMeta = this.getConfigByName(configName).meta
        return (
            compConfigMeta.viewOnly 
            || compConfigMeta.viewOperation 
            || compConfigMeta.operationOnly
            || compConfigMeta.id === PAGE_CONFIG_NAME
            || compConfigMeta.id === FLOW_CONFIG_NAME
        )
    }

    isConfigFlowType = (configName) =>{
        return (
            configName === FLOW_CONFIG_NAME
        )
    }

    isFlowElement = (element) => {
        const configName = this.getConfigName(element)
        const compConfigMeta = this.getConfigByName(configName).meta
        return this.isConfigFlowType(compConfigMeta.id);
    }

    getConfigName(element) {
        return element.meta.componentId;
    }

    isContainerElement (element) {
        const configName = element.meta.componentId;
        const compConfigMeta = this.getConfigByName(configName).meta
        return (
            compConfigMeta.id === PAGE_CONFIG_NAME
            || compConfigMeta.id === MODEL_CONFIG_NAME
        )
    }


    isViewOnlyElement(data) {
        const configName = data.meta.componentId;
        return this.getConfigByName(configName).meta.viewOnly
    }

    isViewOperationElement(data) {
        const configName = data.meta.componentId;
        return this.getConfigByName(configName).meta.viewOperation
    }

    isOperationOnlyElement(data) {
        const configName = data.meta.componentId;
        return this.getConfigByName(configName).meta.operationOnly
    }

    elementMenuItems(element) {
        const configName = element.meta.componentId;
        return clone(this.getConfigByName(configName).menuItems);
    }

}

export default DynManager;