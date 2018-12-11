import { DATA_TYPES } from '../constants';
import { generateInputOutput } from '../../common/utils';

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
    }
};

export default { queryInputConfig, queryOutputConfig, queryConfig };