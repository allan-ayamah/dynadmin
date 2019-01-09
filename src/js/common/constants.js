export const Action = {
    Load: 'load',
    FOCUS: "FOCUS",
    CREATE: "create",
    CREATED : "CREATED",
    DELETE: "DELETE",
    DELETE_SUCCESS: "DELETE_SUCCESS",
    DELETE_FAIL: "DELETE_FAIL",
    EditProps: 'ep',
    Copy: 'copy',
    Paste: 'ps',
    FLOW_DRAW_BEGIN: 'fdb',
    FLOW_DRAW_END: 'fde',
    FLOW_DRAW_ABORT: "fda",
    Add: "add",
}

export const UIManager = {
    LAYOUT_BUILDER: "Layout",
}
  

export const PREDICATES = {
    label: ['Equal', 'Greater or Equal', 'Greater Than', 'Less or Equal', 'Less Than', 'Not Equal'],
    value: ['eq', 'ge', 'gt', 'le', 'lt', 'ne'],
}

export const DATA_TYPES = {
    label: ['string', 'text', 'date', 'int', 'float'],
    value: ['string', 'text', 'date', 'int', 'float'],
}

export const CONTENT_TYPES = {
    label: ['text/plain', 'text/html'],
    value: ['text', 'html'],
}

export const LINK_TYPES = {
    NAVIGATION_NORMAL: 'nav',
    NAVIGATION_AUTO: 'auto',
    DATA_FLOW: 'transport',
}

export const RESULT_CODE_PROPERTY_NAME = "resultCode";
export const RESULT_SUCCESS_CODE = "success";
export const RESULT_ERROR_CODE = "error";

export const SCRIPT_TYPE = {
    JAVASCRIPT: 'JS',
    GROOVY: 'GVY'
}
