import { DATA_TYPES } from '../constants';
import { generateInputOutput, _forEach } from '../../common/utils';

const QUERY_MODE = {
    SELECT: 'select',
    UPDATE: 'update',
}

export const queryInputConfig = {
    meta: {
        id: 'qryI',
        namePrefix: 'Query Input',
        label: 'Query Input',
        icon: 'query-input',
        flowSource: true,
        targetSource: true,
        isViewOperation: true,
        maxOKLink: 1,
        maxKOLink: 1,
        maxNormalLink: -1,
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        dataType: {
            type: 'string',
            name: 'Type',
            data: DATA_TYPES,
            default: '',
        },
        value: {
            type: 'string',
            name: 'Value',
            help: 'Value for static values',
        },
        required: {
            type: 'boolean',
            name: 'Required',
            default: true,
        }
    }
};

export const queryOutputConfig = {
    meta: {
        id: 'qryO',
        namePrefix: 'Query Output',
        label: 'Query Output',
        icon: 'query-output',
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        dataType: {
            type: 'string',
            name: 'Type',
            data: DATA_TYPES,
            default: '',
        }
    }
};


export const queryConfig = {
    meta: {
        id: 'query',
        namePrefix: 'Query',
        label: 'Query',
        icon: 'Query',
        group: 'utilityComponents',
        viewOperation: true,
        flowSource: true,
        flowTarget: true,
    },
    properties: {
        name: {
            type: 'string',
            name: 'Name',
            required: true,
        },
        database: {
            type: 'string',
            name: 'Database',
            data: {
                value: ['icare', 'iplan'],
                label: ['ICare', 'IPlan'],
            },
            default: 'icare',
        },
        mode: {
            type: 'string',
            name: 'Mode',
            data: {
                value: [QUERY_MODE.SELECT, QUERY_MODE.UPDATE],
                label: ['Select', 'Update']
            },
            default: QUERY_MODE.SELECT,
            isEnabled: (data) => {
                return data.database ? true : false;
            }
        },
        queryText: {
            type: 'text',
            name: 'Query Text',
            label: 'Query Text',
        },
        maxResult:{
            type: 'int',
            name: 'Max Result',
            isEnabled: (data) => {
                return data.mode === QUERY_MODE.SELECT;
            }
        },
        blockFactor: {
            type: 'int',
            name: 'Block Factor',
            isEnabled: (data) => {
                return data.mode === QUERY_MODE.SELECT;
            }
        },
        blockWindow: {
            type: 'int',
            name: 'Block Window',
            isEnabled: (data) => {
                return data.mode === QUERY_MODE.SELECT;
            }
        }
    },
    subComponents: {
        queryInputs: {
            componentConfigName: queryInputConfig.meta.id
        },
        queryOutputs: {
            componentConfigName: queryOutputConfig.meta.id
        }
    },
    input: (data, children) => {
        const inputElements = children.filter((element) => {
            if(element.meta.configName === queryInputConfig.meta.id) {
                return element;
            }
        });
        return generateInputOutput(data.meta.localId, inputElements);
    },   
    output: (data, children) => {
        if(!children) return [];
        const outputElements = children.filter((element) => {
            if(element.meta.configName === queryOutputConfig.meta.id) {
                return element;
            }
        });
        return generateInputOutput(data.meta.localId, outputElements);
    },
    logic: (component) => {
        const descr = {
            service: "com.atena.dynzilla.component.utilities.QueryComponentService",
            name: component.name,
            databaseId: component.database,
            mode: component.mode,
            queryText: component.queryText,
            maxResult: component.maxResult,
            blockFactor: component.blockFactor,
            blockWindow: component.blockWindow
        }
        const inputs = [];
        _forEach(component.queryInputs, (qInput) => {
            inputs.push({
                id: qInput.meta.localId, 
                dataType: qInput.dataType, 
                required: qInput.required,
            })
        });
        descr.inputs = inputs;
        const outputs = [];
        _forEach(component.queryOutputs, (qO) => {
            outputs.push({
                id: qO.meta.localId, 
                dataType: qO.dataType, 
            })
        })
        descr.outputs = outputs;
        return descr;
    }
};

export default { queryInputConfig, queryOutputConfig, queryConfig };