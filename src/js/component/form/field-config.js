import { DATA_TYPES, CONTENT_TYPES } from '../constants';
import { SLOT_CONFIG_NAME } from './slot-config';

export const FIELD_CONFIG_NAME = 'fld';

export const fieldConfig = {
    meta: {
        id: FIELD_CONFIG_NAME,
        namePrefix: 'Field',
        label: 'Field',
        icon: 'field',
        elements: [SLOT_CONFIG_NAME],
        acceptsGroups: ['field-validation']
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
};
export default fieldConfig;