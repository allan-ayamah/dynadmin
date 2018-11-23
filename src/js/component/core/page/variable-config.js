export const VARIABLE_CONFIG_NAME = 'var';

export const variableConfig = {
    meta: {
        id: VARIABLE_CONFIG_NAME,
        namePrefix: 'var',
        label: 'Variable',
        icon: '',
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
        },
        dataType: {
            type: 'string',
            name: 'Data type',
            data: {
                label: ['component', 'string', 'text', 'date', 'int', 'float'],
                value: ['component', 'string', 'text', 'date', 'int', 'float'],
            },
        },
        component: {
            type: 'component',
            name: 'Component',
            data: (mgr, _data, page, model) => {
                const allPageElement = mgr.findElements(page);
                console.log(page)
                const pComponents = allPageElement.filter(element => {
                    return mgr.isElementViewOnly(element) 
                            || mgr.isElementViewOperation(element)
                });
                // @todo Find element
                if(pComponents) {
                    return pComponents.map(el => {
                        return {label: el.name, value: el.id}
                    })
                }
                return [];
            },
            isEnabled: (data) => {
                return data.dataType === 'component';
            }
        },
        parameter: {
            type: 'parameter',
            name: 'Parameter',
            dataExpr: '@component.output',
            isEnabled: (data) => {
                return data.unit != undefined && data.unit != ''
            }
        },
        value: {
            type: 'string',
            label: 'Value',
        }
    },
    logic: {

    }
}

export default variableConfig;