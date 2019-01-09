import {ACTIVATION_EXPR_CONFIG_NAME} from './activation-expression-config';
import {VARIABLE_CONFIG_NAME} from './variable-config';
import { LAYOUT_CONFIG_NAME } from "../grid-layout/default-layout-config";

export const PAGE_CONFIG_NAME = 'page';

export const pageConfig = {
    meta: {
        id: PAGE_CONFIG_NAME,
        namePrefix: 'Page',
        label: 'allan',
        icon: 'page',
        isPage: true,
        style: {
            minWidth: 100,
        }
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        }
    },
    subComponents: {
        unitComponents: {
            componentExpression: (component) => {
                return component.meta.viewOnly || component.meta.viewOperation;
            }
        },
        variables: {
            componentConfigName: VARIABLE_CONFIG_NAME,
        },
        activationExpressions: {
            componentConfigName: ACTIVATION_EXPR_CONFIG_NAME
        },
        layout: {
            maxCard: 1,
            componentConfigName: LAYOUT_CONFIG_NAME
        }
    },
    logic: (page) => {
        const descr = {
            service: "com.atena.dynzilla.core.PageService"
        }
        

        return descr;
    }
    
};
export default pageConfig;