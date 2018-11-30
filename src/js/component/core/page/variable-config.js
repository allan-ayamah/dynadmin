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
                label: ['', 'component', 'string', 'text', 'date', 'int', 'float'],
                value: ['', 'component', 'string', 'text', 'date', 'int', 'float'],
            },
            default: '',
        },
        component: {
            type: 'component',
            name: 'Component',
            data: (_data, page, modelData, mgr) => {
                const viewOperationElements = mgr.findElements(page, (el) => {
                    return mgr.isViewOnlyElement(el) || mgr.isViewOperationElement(el)
                });
                if(!viewOperationElements) return [];
                let values = [{ label: '', value: '' }]
                viewOperationElements.forEach(el => {
                    values.push({ label: el.name, value: el.id })
                })
                //console.log('values', values)
                return values;
            },
            default: '',
            isEnabled: (data) => {
                return data.dataType === 'component';
            }
        },
        parameter: {
            type: 'select',
            name: 'Parameter',
            dataExpr: '@component.output',
            default: '',
            isEnabled: (data) => {
                return data.component !== undefined && data.component !== ''
            }
        },
        value: {
            type: 'string',
            name: 'Value',
            label: 'Value',
        }
    },
}

export default variableConfig;