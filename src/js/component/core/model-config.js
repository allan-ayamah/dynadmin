import {PAGE_CONFIG_NAME} from '../core/page/page-config';

export const MODEL_CONFIG_NAME = 'mdl';

export const modelConfig = {
    meta: {
        id: MODEL_CONFIG_NAME,
        namePrefix: 'Dynamic form',
        label: 'Dynamic form',
        icon: 'model',
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        },
    },
    subComponents: {
        pages: {
            componentConfigName: PAGE_CONFIG_NAME
        },
        operationComponents: {
            componentExpression: (component) => {
                return component.meta.isOperationOnly || component.meta.viewOperation
            }
        }
    }
};
export default modelConfig;