import { SCRIPT_TYPE } from '../../constants';

export const ACTIVATION_EXPR_CONFIG_NAME = 'actExpr';
export const activationExpressionConfig = {
    meta: {
        id: ACTIVATION_EXPR_CONFIG_NAME,
        label: 'Activation expression',
        namePrefix: 'Activation expression',
        icon: '',
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        scriptType: {
            type: 'string',
            name: 'Script type',
            data: {
                value: [SCRIPT_TYPE.JAVASCRIPT, SCRIPT_TYPE.GROOVY],
                label: ['Javascript', 'Groovy']
            },
            default: SCRIPT_TYPE.JAVASCRIPT
        },
        scriptText: {
            type: 'text',
            name: 'Script',
            required: true,
        }
    }
}

export default activationExpressionConfig;