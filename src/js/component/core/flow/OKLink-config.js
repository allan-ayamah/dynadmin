import { LINK_TYPES } from 'js/common/constants';

import { _forEach, _getLocalId } from "js/common/utils";

export const OKLINK_CONFIG_NAME = 'okln';

export const OKLinkConfig = {
    meta: {
        id: OKLINK_CONFIG_NAME,
        namePrefix: 'OKLink',
        label: 'OKLink',
        icon: 'oklink',
        isOKLink: true,
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

export default OKLinkConfig;