export const SLOT_CONFIG_NAME = 'slot';

export const slotConfig = {
    meta: {
        id: SLOT_CONFIG_NAME,
        namePrefix: 'Slot',
        label: 'Slot',
        icon: 'slot',
        isAttribute: true
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        output: {
            type: 'boolean',
            name: 'Output',
            default: true,
        },
        label: {
            type: 'boolean',
            name: 'Label',
            default: true,
        },
        value: {
            type: 'string',
            name: 'Value',
            help: 'Values are divided by the character |'
        }
    }
};

export default slotConfig;