import {ACTIVATION_EXPR_CONFIG_NAME} from './activation-expression-config';
import {VARIABLE_CONFIG_NAME} from './variable-config';

export const PAGE_CONFIG_NAME = 'page';

export const pageConfig = {
    meta: {
        id: PAGE_CONFIG_NAME,
        namePrefix: 'Page',
        label: 'Page',
        icon: 'page',
        elements: [VARIABLE_CONFIG_NAME, ACTIVATION_EXPR_CONFIG_NAME],
        style: {
            minWidth: "100px",
        }
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        }
    }
};
export default pageConfig;