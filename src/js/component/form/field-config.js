import { DATA_TYPES, CONTENT_TYPES } from 'js/common/constants';
import { SLOT_CONFIG_NAME } from './slot-config';

export const FIELD_CONFIG_NAME = 'fld';

export const fieldConfig = {
    meta: {
        id: FIELD_CONFIG_NAME,
        namePrefix: 'Field',
        label: 'Field',
        icon: 'field',
        isAttribute: true,
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        dataType: {
            type: 'string',
            name: 'Input type',
            required: true,
            data: DATA_TYPES,
            default: DATA_TYPES.value[0]
        },
        preloaded: {
            type: "boolean",
            name: "Preloaded",
            default: false,
        },
        contentType: {
            type: 'string',
            name: 'Content type',
            data: CONTENT_TYPES,
        },
        readOnly: {
            type: 'boolean',
            name: 'Read Only',
            default: false
        }
    },
    subComponents: {
        slots: {
            componentConfigName: SLOT_CONFIG_NAME
        },
        validationRules: {
            componentGroups: ["field-validation"]
        }
    }
};
export default fieldConfig;