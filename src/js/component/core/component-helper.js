import DynAdminService, { ADMIN_LOG_TYPE } from "js/common/dynadmin-service";
import { _isFunction, _forEach, _isString } from "js/common/utils";

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
    forEachSubcomponent = (callback, segments) => {
        if(!_isFunction(callback)) {
            return;
        }
        const component = this.model.getComponent(this.fullId);
        let actualSegments = []
        if(segments === undefined || segments === null) {
            actualSegments = this.config.segments;
        } else {
            if(_isString(segments)) {
                actualSegments = [segments];
            } else if(Array.isArray(segments)) {
                actualSegments = Array.from(segments);
            }
        }
        actualSegments.forEach(scName => {
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
        return this.config.meta.isPage ?  true : false;
    }

    isOKLink() {
        return this.mgr.isOKLink(this.model, this.config.meta.id);
    }

    isKOLink() {
        return this.mgr.isKOLink(this.model, this.config.meta.id);
    }

    isNormalLink() {
        return this.mgr.isNormalLink(this.model, this.config.meta.id);
    }

    isLink() {
        return this.mgr.isLink(this.model, this.config.meta.id);
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

    getLogic(reqired) {
        return this.config.logic;
    }
}