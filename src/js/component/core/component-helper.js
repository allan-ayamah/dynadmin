import DynAdminService, { ADMIN_LOG_TYPE } from "js/common/dynadmin-service";
import { _isFunction, _forEach } from "js/common/utils";

export default class ComponentHelper extends DynAdminService {
    constructor(model, fullId, componentConfig) {
        super(model.mgr);
        this.model =  model;
        this.fullId = fullId;
        this.config = componentConfig;
        this.logDebug(`INI Component helper`)  
    }

    canInclude(cfName, inPageContext) {
        this.config.allowedComponents.includes(cfName);
    }

    /**
     * Returns all subcomponents a component
     * 
     * @param {ComponentDefinition} component -- the component
     */
    forEachSubcomponent = (callback) => {
        if(!_isFunction(callback)) {
            return;
        }
        const component = this.model.getComponent(this.fullId);
        this.config.segments.forEach(scName => {
            const scEntries = component[scName];
            if(scName && scEntries) {
                _forEach(scEntries, (subcomponent) => {
                    callback(subcomponent, subcomponent.id)
                })
            }
        });
    }

    getSubcomponents() {
        const resultArr = [];
        this.forEachSubcomponent( (sc) => {
            resultArr.push(sc)
        })
        return resultArr;
    }

    isUnitComponent() {
        return this.config.isUnitComponent();
    }

    isPage() {
        return this.config.isPage();
    }

    isOKLink() {
        return this.config.meta.isOKLink ? true : false;
    }

    isKOLink() {
        return this.config.meta.isKOLink ? true : false;
    }

    isNormalLink() {
        return this.config.meta.isNormalLink ? true : false;
    }

    isLink() {
        return this.isNormalLink() || this.isOKLink() || this.isKOLink()
    }

    isContainer() {
        return this.config.isContainer();
    }

    parentId() {
        return this.model.getParentIdOf(this.fullId);
    }

    isStageComponent() {
        if(this.isLink() || this.isContainer() || this.isUnitComponent())
            return true;
        return false;
    }
}