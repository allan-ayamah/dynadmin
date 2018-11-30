import DynComponent from '../dyn-component';
import { 
    PAGE_CONFIG_NAME, 
    VARIABLE_CONFIG_NAME, 
    ACTIVATION_EXPR_CONFIG_NAME 
} from './default-config'

export default class DynPage extends DynComponent {
    constructor(id, data, config, mgr) {
        
    }
    
    // @override
    accepts(config) {
        const meta = config.meta;
        return [
            VARIABLE_CONFIG_NAME, 
            ACTIVATION_EXPR_CONFIG_NAME
        ].includes(meta.id) || (meta.viewOnly || meta.viewOperation) 
    }

    contentUnits() {
        return this.findComponents(comp => { 
            const meta = comp.config.meta;
            return meta.viewOnly || meta.viewOperation
        });
    }

    variables() {
        return this.findComponents(comp => {
            comp.config.meta.id === VARIABLE_CONFIG_NAME 
        });
    }

    activationExpressions() {
        return this.findComponents(comp => {
            comp.config.meta.id === ACTIVATION_EXPR_CONFIG_NAME 
        });
    }

}