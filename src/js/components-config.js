import { Form, group as formGroup, validationRules as formValdationRules } from './component/form/index.js';
import { Query } from './component/query/index.js';


export const componentsConfig = [
    ...Form, ...Query,
];

export const validationRules = [
    ...formValdationRules
];

export const componentGroups = [ 
    {
        id: 'viewComponents',
        name: 'View components',
        section: 'add',
        viewItemsInSubMenu: true,
    },
    {
        id: 'utilityComponents',
        name: 'Utilities',
        section: 'add',
        viewItemsInSubMenu: true,
    },
    ...formGroup,
]

export default componentsConfig;