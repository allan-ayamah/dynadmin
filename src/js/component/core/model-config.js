import {PAGE_CONFIG_NAME} from '../core/page/page-config';

export const MODEL_CONFIG_NAME = 'mdl';

export const modelConfig = {
    meta: {
        id: MODEL_CONFIG_NAME,
        namePrefix: 'Dynamic form',
        label: 'Dynamic form',
        icon: 'model',
        elements: [PAGE_CONFIG_NAME]
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        },
    },
};
export default modelConfig;