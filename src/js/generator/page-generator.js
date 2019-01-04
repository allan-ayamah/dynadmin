
class DefaultGenerator extends DynAdminService {
    constructor(mgr) {
        super(mgr);
        this.model =  model;
    }


    generateComponent(fullId) {
        try {
            const component = model.getComponent(fullId);
            if(!component) {
                this.logDebug(`Component"${ fullId }" does not exist`)
            }
            const componentHelper = model.getComponentHelper(fullId)
            
            // generate descriptor logic
            const logic = componentHelper.getLogic();
            return descr = logic(component);
        } catch (ex) {
            this.logError(`Component["${ fullId }"]: error generating logic descriptor`, ex)
        } finally {

        }
        
    }

}