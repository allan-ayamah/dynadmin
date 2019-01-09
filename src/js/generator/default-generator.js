import DynAdminService from "js/common/dynadmin-service"
import { _forEach, StringUtils } from "js/common/utils";
import Data from "../component/data";
import { LINK_TYPES, RESULT_SUCCESS_CODE, RESULT_ERROR_CODE } from "js/common/constants";

const DYNContextType = {
    OPERATION: "operationContext",
    PAGE: "pageContext",
}

export default class DefaultGenerator extends DynAdminService {
    constructor(model) {
        super(model.mgr);
        this.data = new Data();
        this.model =  model;
    }

    getDescriptor() {
        return this.data;
    }

    generate(id) {
        const model = this.model;
        const component = model.getComponent(id);
        const componentHelper = model.getComponentHelper(id);
        if(component === undefined || component === null) {
            return;
        }
        // generate descriptor
        const componentDescr = this.generateComponent(component);
        if(componentDescr && !componentHelper.isLink()) {
             //compute context information
            const contextType = this.getContext(component, componentHelper);
            let  DYNContext = null;
            if(contextType === DYNContextType.PAGE) {
                DYNContext = this.computePageContext(component, componentHelper);
            } else {
                DYNContext = this.computeOperationContext(component, componentHelper);
            }
            // append to component descriptor
            componentDescr.DYNContext = DYNContext;
            this.saveDescriptor(component.meta.localId, componentDescr);
        }
        // generate subcomponents
        const _this = this;
        componentHelper.forEachSubcomponent((sc) => {
            if(!model.getComponentHelper(sc.id).isAttribute()) {
                _this.generate(sc.id);
            }
        })

    }

    generateComponent(component) {
        try {
            const componentHelper = this.model.getComponentHelper(component.id)
            const logic = componentHelper.getLogic(true);
            if(!logic) {
                return null;
            }
            // generate descriptor logic
            const descr = logic(component, this.model);
            return descr;
        } catch (ex) {
            this.logError(`Component["${ component.id }"]: error generating logic descriptor`, ex)
            throw new Error(ex);
        } 
    }

    computePageContext(component, componentHelper) {
        return  {
            context: DYNContextType.PAGE
        }
    }

    computeOperationContext(component, componentHelper) {
        const DYNContext = {
            context: DYNContextType.OPERATION
        }
        const koLinks = [], okLinks = [], transportLinks = [];
        const model = this.model;
        _forEach(component.outgoingLinks, (link) => {
            const linkHelper = model.getComponentHelper(link.id);
            const outLinkObj = {
                id: link.meta.localId
            }
            let resultCode = link.resultCode;
            if(StringUtils.isBlank(resultCode)) {
                if(linkHelper.isOKLink()) {    
                    resultCode = RESULT_SUCCESS_CODE;
                } else if(linkHelper.isKOLink()) {
                    resultCode = RESULT_ERROR_CODE;
                }
            }
            outLinkObj.resultCode = resultCode;
            if(link.type === LINK_TYPES.TRANSPORT) {
                outLinkObj.transport = true;
                transportLinks.push(outLinkObj)
            }
            if(linkHelper.isOKLink()) {    
                okLinks.push(outLinkObj)
            } else if(linkHelper.isKOLink()) {
                koLinks.push(outLinkObj);
            }
        })

        DYNContext.outgoingLinks = [];
        if(transportLinks.length > 0) {
            if(okLinks.length > 0) {
                okLinks.forEach((okLn) => {
                    transportLinks.forEach((tspLink) => {
                        const copy = Object.assign({}, tspLink, {
                            resultCode: okLn.resultCode
                        })
                        DYNContext.outgoingLinks.push(copy);
                    })
                })
            }

            if(koLinks.length > 0) {
                koLinks.forEach((koLn) => {
                    transportLinks.forEach((tspLink) => {
                        const copy = Object.assign({}, tspLink, {
                            resultCode: koLn.resultCode
                        })
                        DYNContext.outgoingLinks.push(copy);
                    })
                })
            }
        }
        DYNContext.outgoingLinks.push(...okLinks);
        DYNContext.outgoingLinks.push(...koLinks);
        return DYNContext;
    }


    getContext(component, componentHelper) {
        const parentId = componentHelper.getParentId();
        if(parentId) {
            const parentHelper = this.model.getComponentHelper(parentId);
            if(parentHelper.isPage()) {
                return DYNContextType.PAGE;
            }
        }
        return DYNContextType.OPERATION;
    }

    saveDescriptor(localId, descr) {
        this.data.set(`descriptors.${localId}`, descr);
    }

}