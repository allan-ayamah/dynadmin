import { PREDICATES } from '../constants';


export const manditoryVaidationRuleConfig = {
    meta: {
        id: 'mndtry',
        namePrefix: 'Manditory',
        label: 'Manditory validation rule',
        icon: 'validate-manditory',
        group: 'field-validation'
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        companionField: {
            type: 'any',
            name: 'Companion Field',
            required: false,
            default: '',
        },
        predicate: {
            type: 'string',
            name: 'Predicate',
            data: PREDICATES,
        },
        ignoreCase: {
            type: 'boolean',
            name: 'Ignore Case',
            default: false,
        },
        value: {
            type: 'string',
            name: 'Value',
        },
        errorMessage: {
            type: 'string',
            name: 'Error Message',
            help: 'Errore message to show when validation fails'
        }
    },
    elements: []
};
export default manditoryVaidationRuleConfig;