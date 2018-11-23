import {PAGE_CONFIG_NAME} from '../core/page/page-config';

export const MODEL_CONFIG_NAME = 'mdl';

export const modelConfig = {
    meta: {
        id: MODEL_CONFIG_NAME,
        namePrefix: 'Dynamic form',
        label: 'Dynamic form',
        icon: 'model'
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        },
    },
    elements: [PAGE_CONFIG_NAME]
};
export default modelConfig;