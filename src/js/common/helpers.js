import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';

export const get = lodashGet
export const set = lodashSet
export const clone = cloneDeep 

export const describeId = (childId) => {
    const parts = childId.split('.');
    if(parts.length === 1) {
        return {
            parentId: null,
            childId: childId,
            localId: childId
        };
    }
    
    const localId = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const parentId =  childId.split(`.${localId}`)[0];
    return {
        parentId,
        childId,
        localId
    };    
}

export const h = {
    get,
    set,
}

export default {describeId, h};