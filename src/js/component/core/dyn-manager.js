import Model from './model';
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
        this.OKLinkName = null;
        this.KOLinkName = null;
        this.NormalLinkName = null;
        this.linkNames = new Set();
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
        const model = new Model(modelId, modelData, this);

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
        const _this = this;
        const configArr = Array.isArray(newConfig) ? newConfig : [newConfig];
        configArr.forEach(configItem => {
            const configName = configItem.meta.id;
            let config = null;
            if(this.getConfigByName(configName)) {
                if(!overrideAlways) return;
                delete this.componentConfigs[configName];   
            }
            config = this.componentConfigs[configName] = Object.assign({}, configItem);

            if(config.meta.isNormalLink === true) {
                _this.NormalLinkName = configName;
                _this.linkNames.add(configName);
            }

            if(config.meta.isOKLink === true) {
                _this.OKLinkName = configName;
                _this.linkNames.add(configName);
            }

            if(config.meta.isKOLink === true) {
                _this.KOLinkName = configName;
                _this.linkNames.add(configName);
            }

            config.isContainer = () => {
                if(config.meta.isContainer === true) 
                    return true;
                if(config.meta.isContainer === false) 
                    return false;
                if(config.meta.isPage) 
                    return true;
                return false;
            }

            config.isUnitComponent = function() {
                const meta = config.meta;
                if(meta.viewOperation || meta.OperationOnly
                    || meta.viewOnly) {
                    return true;
                }
                return false;
            }
        })

        // register
        const componentsName = Object.keys(this.componentConfigs);
        componentsName.forEach(configName => {
            const config = this.componentConfigs[configName];
            config.segments = new Set();
            config.scConfigToSegmentMap = new Map();
            config.allowedComponents = [];
            config.allowedLinks = new Set();
            const defaultAddElements = [];
            
            // add links
            if(config.meta.flowSource === true) {
                config.allowedLinks.add(this.NormalLinkName);
                if(config.meta.operationOnly === true  
                    || config.meta.viewOperation) {
                    config.allowedLinks.add(this.OKLinkName);
                    config.allowedLinks.add(this.KOLinkName);
                }
            }
            if(config.allowedLinks.size > 0) {
                config.allowedComponents.push(...config.allowedLinks);
                defaultAddElements.push(...config.allowedLinks);
            }

            // process subComponents
            if(config.subComponents) {
                const subComponentKeys = Object.keys(config.subComponents);
                subComponentKeys.forEach(subCompKey => {
                    config.segments.add(subCompKey);
                    const subComponent = config.subComponents[subCompKey];
                    const subCompConfigName = subComponent.componentConfigName;
                    if(subCompConfigName) {
                        config.scConfigToSegmentMap.set(subCompConfigName, subCompKey);
                        config.allowedComponents.push(subCompConfigName)
                        defaultAddElements.push(subCompConfigName);
                    } else if(typeof subComponent.componentExpression === 'function') {
                        const fn = subComponent.componentExpression;
                        componentsName.forEach(cfgName => {
                            if(fn(this.componentConfigs[cfgName])) {
                                config.allowedComponents.push(cfgName)
                                config.scConfigToSegmentMap.set(cfgName, subCompKey);
                            }
                        })
                    } else if(subComponent.componentGroups) {
                        const groups = subComponent.componentGroups; 
                        componentsName.forEach(cfgName => {
                            if(groups.includes(cfgName)) {
                                config.allowedComponents.push(cfgName)
                                config.scConfigToSegmentMap.set(cfgName, subCompKey);
                            }
                        })
                    }
                })
            }
            // Flow must always at the bottom
            config.segments.add("outgoingLinks");
            if(config.allowedLinks.size > 0) {
                config.allowedLinks.forEach((linkName) => {
                    config.scConfigToSegmentMap.set(linkName, "outgoingLinks");
                })
            }

            config.canInclude = (cfName) => {
                config.allowedComponents.includes(cfName);
            }

            config.getSCSegment = (cfName) => {
                return config.scConfigToSegmentMap.get(cfName);
            }

            /**
             * Returns all subcomponents a component
             * 
             * @param {ComponentDefinition} component -- the component
             */
            config.getSC = (component) => {
                console.log(`${configName} SC keys`, config.segments)
                const resultArr = [];
                config.segments.forEach(scName => {
                    const scEntries = component[scName];
                    if(scName && scEntries) {
                        console.log(`${configName} GET SC: ${scName}`, component)
                        Object.keys(scEntries).forEach( entryKey => {
                            resultArr.push(scEntries[entryKey]);
                        })
                    }
                });
                return resultArr;
            }
            // generate menuItems
            // console.log(defaultAddElements)
            config.menuItems = [];
            console.log(`Component[${configName}], can include: `, config.allowedComponents, defaultAddElements)
            config.allowedComponents.forEach(cName => {
                const elConfig = this.componentConfigs[cName]
                if(elConfig === undefined){
                    const error = new Error(`Component configuration not found for name ${cName}`);
                    console.error(error);
                    return;
                }
                let menuGroup = "add";
                if(elConfig.meta.group && defaultAddElements.length && 
                    !defaultAddElements.includes[cName]) {
                    menuGroup = elConfig.meta.group;
                }
                config.menuItems.push({
                    name: elConfig.meta.label,
                    componentId:  elConfig.meta.id,
                    action: "add",
                    group: menuGroup,
                    
                });
            });
        }) 
        //console.log(this.componentConfigs)
    }

    /*getAddress(model, id) {
        // mdl1.page1.form1 => mdl1.pages.page1.contentComponents.form1
        const idParts = id.split(".")
        if(idParts.length == 1) {
            // root/model
            return model.get(idParts[0]);
        }
        
        let i = 0;
        let cAddress = idParts[0];
        do {
            const component = model.get(cAddress);
            const cConfig = this.getConfigByName(component.meta.configName);
            const scAddress = cConfig.getSCAddress(component, idParts[i + 1]);
            cAddress = scAddress;
            i++;
        } while(i < idParts.length) 

        return cAddress;
    }*/

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
        const parentComponent = model.get(parentId);
        if(parentComponent === undefined) {
            throw new Error(`Data can not be found for parent id: ${parentId}`);
        }
        console.log(parentId, parentComponent)
        const parentCompConfig = this.getConfigByName(parentComponent.meta.configName);
        const scSegmentOnParent = parentCompConfig.getSCSegment(configName);
        if(scSegmentOnParent === null) {
            throw new Error(`Component[${configName}] segment on ${parentComponent.meta.id} not found`)
        }
        const cConf = this.getConfigByName(configName);
        if(!cConf) {
            throw new Error(`Component config not found for [${configName}]`) 
        }
        const nextValAddress = `${model.id}.meta.${configName}.nextValue`;
        let nextVal = model.get(nextValAddress);
        if(nextVal === undefined) {
            // console.log(`INIT interval for ${configName}`)
            nextVal = 1;
        }
        // update component nextValue
        model.set(nextValAddress, nextVal + 1)
        const localId = `${cConf.meta.id}${nextVal}`;
        const id =  `${parentId}.${scSegmentOnParent}.${localId}`;
        const defaultName = `${cConf.meta.namePrefix}${nextVal}`;
        const data = this.initData(id, localId, defaultName, cConf);

        // @todo Refactor, resolve parent in another way
        data.meta.parentId = parentId
        model.set(id, data);
        return model.get(id);
    }

    getElementIO = (model, elementId) => {
        const element = model.get(elementId);
        const children = this.findElements(element)
        const componentConf = this.getConfigByName(element.meta.configName);
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
        console.log("IO RESULT",children,  inputResult, outputResult)
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

        // subComponents
        data.id = id;
        data.name = name;
        data.meta = {
            localId: localId,
            configName: config.meta.id,
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
        return model.get(childId).meta.parentId
        /*
        const parts = childId.split('.');
        // unit is the last part of the data key
        const assignedId = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        const parentId = childId.split(`.${assignedId}`)[0];
        // console.log("resolve parent", parentId, parts, assignedId)
        return parentId;*/
    }

    
    getComponentPos(model, id) {
        const component = this.model.get(`${id}`);
        const { top, left } = component.meta;
        return {
            left: component.meta.left,
            top: component.meta.top,
        }
    }


    updateComponentPos(model, dataId, posData) {
        model.set(`${dataId}.meta.left`, posData.left);
        model.set(`${dataId}.meta.top`, posData.top);
        model.set(`${dataId}.meta.minWidth`, posData.minWidth);
        model.set(`${dataId}.meta.minHeight`, posData.minHeight);
    }

    /**
     * Returns true if the element can be placed on stage
     * @param {Element} element --the element
     */
    isStageElement(element) {
        const configName = element.meta.configName;
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

   

    getConfigName(element) {
        return element.meta.configName;
    }

    elementMenuItems(element) {
        const configName = element.meta.configName;
        return clone(this.getConfigByName(configName).menuItems);
    }
}

export default DynManager;