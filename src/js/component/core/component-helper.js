import DynAdminService, { ADMIN_LOG_TYPE } from "js/common/dynadmin-service";
import { _isFunction, _forEach, _isString } from "js/common/utils";
import { _cloneDeep } from "../../common/utils";

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
        const component = this.model.getComponent(this.fullId);
        actualSegments.forEach(scName => {
            const scEntries = component[scName];
            _forEach(scEntries, (subcomponent, localId) => {
                callback(subcomponent, localId, scName);
            });
        });
    }

    getNormalizedData() {
        const model = this.model;
        const component = model.get(this.fullId);
        const copy = {}
        Object.keys(this.config.properties).forEach(propName => {
            return copy[propName] = component[propName];
        });

        this.config.segments.forEach(scName => {
            const scEntries = component[scName];
            if(!scEntries) {
                copy[scName] = [];
                return;
            }
            const copyOfEntries = []
            Object.keys(scEntries).forEach((scLocalId) => {
                console.log(`ENTRY ${scLocalId}`)
                if(!scLocalId) return;
                const scHelper = model.getComponentHelper(scEntries[scLocalId].id)
                copyOfEntries.push(scHelper.getNormalizedData());
            })
            copy[scName] = copyOfEntries;
        });
        copy.id = component.meta.localId;
        return copy;
    }

    getSubcomponents(segments) {
        const resultArr = [];
        this.forEachSubcomponent( (sc) => {
            resultArr.push(sc)
        }, segments)
        return resultArr;
    }

    // @to-do
    hasSubcomponents() {
        return this.getSubcomponents().length > 0;
    }

    

    getOutgoingLinksIds() {
        const resultArr = [];
        this.forEachSubcomponent( (sc) => {
            resultArr.push(sc.id)
        }, ["outgoingLinks"])
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

    getParentId() {
        return this.model.getParentId(this.fullId);
    }

    isStageComponent() {
        if(this.isLink() || this.isContainer() || this.isUnitComponent())
            return true;
        return false;
    }

    isAttribute() {
        return this.config.meta.isAttribute;
    }

    getLogic(reqired) {
        return this.config.logic;
    }
}