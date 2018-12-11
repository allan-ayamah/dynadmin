import { generateInputOutput } from '../../common/utils';
import { SELECTION_FIELD_CONFIG_NAME } from './selection-field-config';
import { FIELD_CONFIG_NAME } from './field-config';

const defaultComponents = [
    FIELD_CONFIG_NAME, 
    SELECTION_FIELD_CONFIG_NAME
];

export const formConfig = {
    meta: {
        id: 'form',
        namePrefix: 'Form',
        label: 'Form',
        icon: 'form',
        viewOnly: true,
        flowSource: true,
        flowTarget: true,
        group: 'viewComponents',
        elements: defaultComponents,
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        }
    },
    subComponents: {
        fields: {
            componentConfigName: FIELD_CONFIG_NAME
        },
        selectionFields: {
            componentConfigName: SELECTION_FIELD_CONFIG_NAME,
        }
    },
    input: (data, children) => {
        if(!children)  return []
        const fieldElements = children.filter((element) => {
            const componentId = element.meta.configName;
            if(defaultComponents.includes(componentId)) {
                return element;
            }
        });
        return generateInputOutput(data.meta.localId, fieldElements);
    },
    output: (data, children) => {
        if(!children)  return []
        const fieldElements = children.filter((element) => {
            const componentId = element.meta.configName;
            if(defaultComponents.includes(componentId)) {
                return element;
            }
        });
        return generateInputOutput(data.meta.localId, fieldElements);
    }
};

export default formConfig;