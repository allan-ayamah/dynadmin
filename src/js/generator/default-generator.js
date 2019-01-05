import DynAdminService from "js/common/dynadmin-service"
import { _forEach } from "js/common/utils";
import Data from "../component/data";

export default class DefaultGenerator extends DynAdminService {
    constructor(model) {
        super(model.mgr);
        this.data = new Data();
        this.model =  model;
    }

    getDescriptor() {
        return this.data;
    }

    generateOperation(id) {
        const component = this.model.getComponent(id);
        if(component === undefined || component === null) {
            return;
        }
        
        const componentDescr = this.generateComponent(component);
        const _this = this;
        this.logDebug(`OUtgoind: `, component.outgoingLinks)
        _forEach(component.outgoingLinks, (link, localId) => {
            _this.logDebug(`Generate link "${localId}"`);
            const linkDescr = _this.generateComponent(link);
            this.saveDescriptor(localId, linkDescr);

            const targetId = link.target;
            if(targetId) {
                _this.logDebug(`Next target ${targetId}`);
                _this.generateOperation(targetId);
            }
        })
        this.saveDescriptor(component.meta.localId, componentDescr);
        // @todo follow links to generate other links
    }

    generateComponent(component) {
        try {
            const fullId = component.id;
            const componentHelper = this.model.getComponentHelper(fullId)
            
            // generate descriptor logic
            const logic = componentHelper.getLogic(true);
            const descr = logic(component, this.model);
            return descr;
        } catch (ex) {
            this.logError(`Component["${ component.id }"]: error generating logic descriptor`, ex)
        } finally {

        }
    }

    saveDescriptor(localId, descr) {
        this.data.set(`descriptors.${localId}`, descr);
    }

}