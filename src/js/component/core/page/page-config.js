import {ACTIVATION_EXPR_CONFIG_NAME} from './activation-expression-config';
import {VARIABLE_CONFIG_NAME} from './variable-config';

export const PAGE_CONFIG_NAME = 'page';

export const pageConfig = {
    meta: {
        id: PAGE_CONFIG_NAME,
        namePrefix: 'Page',
        label: 'Page',
        icon: 'page',
        isPage: true,
        style: {
            minWidth: 100,
        }
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        }
    },
    subComponents: {
        contentComponents: {
            componentExpression: (component) => {
                return component.meta.viewOnly || component.meta.viewOperation;
            }
        },
        variables: {
            componentConfigName: VARIABLE_CONFIG_NAME,
        },
        activationExpressions: {
            componentConfigName: ACTIVATION_EXPR_CONFIG_NAME
        }
    }
    
};
export default pageConfig;