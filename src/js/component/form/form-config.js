import { generateInputOutput, _forEach, _getLocalId } from '../../common/utils';
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
            componentConfigName: SELECTION_FIELD_CONFIG_NAME
        },
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
    },
    logic: (component, dyn) => {
        const descr = {
            service: "com.atena.dynzilla.component.view.FormComponent",
        }
        const allFields = [];

        const processFieldType = (fieldsMap, fieldType) => {
            _forEach(fieldsMap, (field) => {
                const fieldDescr = {
                    id: field.meta.localId,
                    fieldType: fieldType,
                    dataType: field.dataType,
                    contentType: field.contentType,
                    preloaded: field.preloaded,
                }
    
                if(field.slots) {
                    const fSlots = [];
                    _forEach(field.slots, (slot, slotId) => {
                        fSlots.push({
                            id: slotId,
                            output: slot.output,
                            label: slot.label,
                            value: slot.value
                        })
                    })
                    if(fSlots.length > 0) {
                        fieldDescr.slots = fSlots;
                    }
                }
    
                // @todo extract validations
                allFields.push(fieldDescr);
            })    
        }

        processFieldType(component.fields, "Field");
        processFieldType(component.selectionFields, "SelectionField");
        return descr;
    }
};

export default formConfig;