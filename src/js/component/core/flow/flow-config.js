import { FLOW_TYPE } from '../../constants';

export const FLOW_CONFIG_NAME = 'lnk';

export const flowConfig = {
    meta: {
        id: FLOW_CONFIG_NAME,
        namePrefix: 'Flow',
        label: 'Flow',
        icon: 'link',
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        source: {
            type: 'string',
            name: 'Source',
            help: 'The page or component which starts the flow',
            isEnabled : () => { return false }
        },
        target: {
            type: 'string',
            name: 'Target',
            help: 'The page or component which ends the flow',
            isEnabled : () => { return false }
        },
        type: {
            type: 'string',
            name: 'Type',
            required: true,
            data: {
                value: [
                    FLOW_TYPE.NAVIGATION_NORMAL, 
                    FLOW_TYPE.NAVIGATION_AUTO, 
                    FLOW_TYPE.DATA_FLOW
                ],
                label: [
                    'normal navigation', 
                    'automatic navigation', 
                    'data flow'
                ]
            },
            default: FLOW_TYPE.NAVIGATION_NORMAL
        },
        validate: {
            type: 'boolean',
            name: 'Validate',
            help: 'Validate the component which starts the flow',
            default: true,
            isEnabled: (data) => { 
                // @todo enable only if source component has validations(ex form)
                return true;
            }
        }
    },
};

export default flowConfig;