import StringUtils from "underscore.string"
import _isFunction from "lodash/isFunction"
import _isEqual from "lodash/isEqual"
import _forEach from "lodash/forEach"
import _get from "lodash/get"
import _set from "lodash/set"
import _cloneDeep from "lodash/cloneDeep";
import _isString from "lodash/isString";
import _unset from "lodash/unset"
/**
 * Return an array of object
 * @param {Array[DynElement]} elements 
 */
export const generateInputOutput = (parentLocalId, elements) =>  {
    if(!elements) return [];
    return elements.map((fldEl) => {
        return {
            id: `${fldEl.meta.localId}`,
            value: `${fldEl.meta.localId}`,
            label: fldEl.name,
        }
    });
}

const _getLocalId = (childId) => {
    const parts = childId.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : parts[0]; 
}

export { 
    StringUtils,
    _isString,
    _isFunction,
    _isEqual,
    _forEach,
    _getLocalId,
    _cloneDeep,
    _get,
    _set,
    _unset,
}