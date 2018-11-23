import {MODEL_CONFIG_NAME, modelConfig} from './model-config'
import {PAGE_CONFIG_NAME, pageConfig} from './page/page-config';
import {variableConfig} from './page/variable-config';
import activationExpressionConfig from './page/activation-expression-config';

export const DEFAULT_COMPONENTS_CONFIG = [
    modelConfig, 
    pageConfig, 
    variableConfig, 
    activationExpressionConfig 
]

export {MODEL_CONFIG_NAME, PAGE_CONFIG_NAME}
