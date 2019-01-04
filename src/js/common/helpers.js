import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import lodashIsEquals from 'lodash/isEqual'


export const get = lodashGet
export const set = lodashSet
export const isEqual = lodashIsEquals

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
    isEqual
}

export { cloneDeep as clone, cloneDeep }