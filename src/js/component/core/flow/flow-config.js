import { LINK_TYPES } from 'js/common/constants';
import { _forEach, _getLocalId } from "js/common/utils";

export const FLOW_CONFIG_NAME = 'flow';

export const flowConfig = {
    meta: {
        id: FLOW_CONFIG_NAME,
        namePrefix: 'Flow',
        label: 'Flow',
        icon: 'link',
        isNormalLink: true
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
                    LINK_TYPES.NAVIGATION_NORMAL, 
                    LINK_TYPES.NAVIGATION_AUTO, 
                    LINK_TYPES.TRANSPORT,
                ],
                label: [
                    'normal navigation', 
                    'automatic navigation', 
                    'data flow'
                ]
            },
            default: LINK_TYPES.NAVIGATION_NORMAL
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
    logic: (component) => {
        const descr = {
            service: "com.atena.dynzilla.core.LinkService",
            name: component.name,
            sourceId: _getLocalId(component.source),
            targetId: _getLocalId(component.target),
            propagations: component.propagations
        }
        
        return descr;
    }
};

export default flowConfig;