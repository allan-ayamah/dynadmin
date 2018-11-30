import { formConfig } from './form-config';
import { fieldConfig } from './field-config';
import { selectionFieldConfig } from './selection-field-config'
import { slotConfig } from './slot-config';
import { manditoryVaidationRuleConfig } from './field-validation-config'

export const Form = [
    formConfig,
    fieldConfig,
    selectionFieldConfig,
    slotConfig
];

export const validationRules = [
    manditoryVaidationRuleConfig,
];

export const group =  [
    {
        id: 'field-validation',
        name: 'Validation Rule',
        viewItemsInSubMenu: true,
    }
]