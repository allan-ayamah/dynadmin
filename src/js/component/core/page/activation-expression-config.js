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
        }
    }
}

export default activationExpressionConfig;