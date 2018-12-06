export const Action = {
    Load: 'load',
    Add: 'ad',
    EditProps: 'ep',
    Remove: 'rm',
    Copy: 'cp',
    Paste: 'ps'
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

export const FLOW_TYPE = {
    NAVIGATION_NORMAL: 'nav',
    NAVIGATION_AUTO: 'auto',
    DATA_FLOW: 'data',
}

export const SCRIPT_TYPE = {
    JAVASCRIPT: 'JS',
    GROOVY: 'GVY'
}
