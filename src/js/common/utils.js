
/**
 * Return an array of object
 * @param {Array[DynElement]} elements 
 */
export const generateInputOutput = (parentLocalId, elements) =>  {
    if(!elements) return [];
    return elements.map((fldEl) => {
        return {
            id: `${parentLocalId}.${fldEl.meta.localId}`,
            value: `${parentLocalId}.${fldEl.meta.localId}`,
            label: fldEl.name,
        }
    });
}