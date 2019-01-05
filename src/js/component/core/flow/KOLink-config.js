import { FLOW_TYPE } from '../../constants';

import { _forEach, _getLocalId } from "js/common/utils";

export const KOLINK_CONFIG_NAME = 'koln';

export const KOLinkConfig = {
    meta: {
        id: KOLINK_CONFIG_NAME,
        namePrefix: 'KOLink',
        label: 'KOLink',
        icon: 'kolink',
        isKOLink: true
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

export default KOLinkConfig;