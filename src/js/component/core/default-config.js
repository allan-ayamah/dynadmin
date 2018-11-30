import {MODEL_CONFIG_NAME, modelConfig} from './model-config'
import {PAGE_CONFIG_NAME, pageConfig} from './page/page-config';
import {variableConfig} from './page/variable-config';
import activationExpressionConfig from './page/activation-expression-config';
import { FLOW_CONFIG_NAME, components as flows } from './flow/index';

export const DEFAULT_COMPONENTS_CONFIG = [
    modelConfig, 
    pageConfig, 
    variableConfig, 
    activationExpressionConfig, 
    ...flows 
]

export { MODEL_CONFIG_NAME, PAGE_CONFIG_NAME, FLOW_CONFIG_NAME }
