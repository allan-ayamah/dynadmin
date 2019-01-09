
import { _forEach } from "js/common/utils";
import { UIManager } from "js/common/constants";
import { CONTENT_TYPES } from "../../../common/constants";

export const GRID_CONFIG_NAME = 'grid';
export const CELL_CONFIG_NAME = 'cell';
export const LAYOUT_CONFIG_NAME = "layout"

export const ROW_CONFIG_NAME = 'row';
export const COLUMN_CONFIG_NAME = 'col';

export const CONTENT_CONFIG_NAME = "unitRef";
export const ATTIBUTE_CONFIG_NAME = "attr";
export const ATTRIBUTE_LABEL_CONFIG_NAME= "attrLbl";
export const ATTRIBUTE_VALUE_CONFIG_NAME="attrVal";

const PAGE_CONTENT_CONFIG_NAMES = [
    CONTENT_CONFIG_NAME,
    ATTIBUTE_CONFIG_NAME,
    ATTRIBUTE_LABEL_CONFIG_NAME,
    ATTRIBUTE_VALUE_CONFIG_NAME,
]

const COLSPAN_LIST = [1, 2, 3, 4, 5, 6];
const ROWSPAN_LIST = [1, 2, 3, 4, 5, 6];
const MAX_COLSPAN = 6;

export const LayoutConfig = {
    meta: {
        id: LAYOUT_CONFIG_NAME,
        namePrefix: 'Layout',
        label: 'Layout',
        icon: 'layout',
        isAttribute: true,
        maxCard: 1,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
    },
    subComponents: {
        grid: {
            componentConfigName: GRID_CONFIG_NAME
        }
    }
};

export const ColumnConfig = {
    meta: {
        id: COLUMN_CONFIG_NAME,
        namePrefix: 'column',
        label: 'Column',
        icon: 'col',
        isAttribute: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false
        },
    },
    subComponents: {
        contents: {
            componentConfigName: PAGE_CONTENT_CONFIG_NAMES
        },
        cells: {
            componentConfigName: CELL_CONFIG_NAME
        }
    }
};

export const ContentUnitConfig = {
    meta: {
        id: CONTENT_CONFIG_NAME,
        namePrefix: 'Content Unit',
        label: 'ContentUnit',
        isAttribute: true,
        isUnitRef: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
        unitId: {
            type: 'string',
            name: 'Unit',
            required: true,
            isEnabled: () => false,
        },
        colSpan: {
            type: 'int',
            name: 'Column span',
            required: false,
            data: COLSPAN_LIST,
            default: COLSPAN_LIST.length
        },
        rowSpan: {
            type: 'int',
            name: 'Row span',
            required: false,
            data: ROWSPAN_LIST,
            default: 1,
        },
    }
};

export const AttibuteConfig = {
    meta: {
        id: ATTIBUTE_CONFIG_NAME,
        namePrefix: 'Attribute',
        label: 'Attibute',
        isAttribute: true,
        isUnitAttribute: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
        unitId: {
            type: 'string',
            name: 'Unit',
            required: true,
        },
        attrId: {
            type: 'string',
            name: 'Attribute',
            required: true,
            isEnabled: false
        },
        colSpan: {
            type: 'int',
            name: 'Column span',
            required: false,
            data: COLSPAN_LIST,
            default: COLSPAN_LIST.length
        },
        rowSpan: {
            type: 'int',
            name: 'Row span',
            required: false,
            data: ROWSPAN_LIST,
            default: 1,
        }
    }
};


export const AttibuteLabelConfig = {
    meta: {
        id: ATTRIBUTE_LABEL_CONFIG_NAME,
        namePrefix: 'AttrLabel',
        label: 'AttrLabel',
        isAttribute: true,
        isAttributeLabel: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
        unitId: {
            type: 'string',
            name: 'Unit',
            required: true,
        },
        attrId: {
            type: 'string',
            name: 'Attribute',
            required: true,
            isEnabled: false
        },
        colSpan: {
            type: 'int',
            name: 'Column span',
            required: false,
            data: COLSPAN_LIST,
            default: COLSPAN_LIST.length
        },
        rowSpan: {
            type: 'int',
            name: 'Row span',
            required: false,
            data: ROWSPAN_LIST,
            default: 1,
        }
    }
}

export const AttibuteValueConfig = {
    meta: {
        id: ATTRIBUTE_VALUE_CONFIG_NAME,
        namePrefix: 'value',
        label: 'Attribute value',
        isAttribute: true,
        isAttributeValue: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
        unitId: {
            type: 'string',
            name: 'Unit',
            required: true,
        },
        attrId: {
            type: 'string',
            name: 'Attribute',
            required: true,
            isEnabled: false
        },
        colSpan: {
            type: 'int',
            name: 'Column span',
            required: false,
            data: COLSPAN_LIST,
            default: COLSPAN_LIST.length
        },
        rowSpan: {
            type: 'int',
            name: 'Row span',
            required: false,
            data: ROWSPAN_LIST,
            default: 1
        }
    }
}

export const CellConfig = {
    meta: {
        id: CELL_CONFIG_NAME,
        namePrefix: 'Cell',
        label: 'Cell',
        icon: 'cell',
        isAttribute: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
        colSpan: {
            type: 'int',
            name: 'Column span',
            required: false,
            data: COLSPAN_LIST,
            default: COLSPAN_LIST.length
        },
        rowSpan: {
            type: 'int',
            name: 'Row span',
            required: false,
            data: ROWSPAN_LIST,
            default: 1
        }
    },
    subComponents: {
        contents: {
            componentConfigName: PAGE_CONTENT_CONFIG_NAMES
        }
    },
};

export const RowConfig = {
    meta: {
        id: ROW_CONFIG_NAME,
        namePrefix: 'Row',
        label: 'Row',
        icon: 'row',
        isAttribute: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
        index: {
            type: 'int',
            name: 'Index of row',
            required: false,
            isEnabled: false
        },
    },
    subComponents: {
        cells: {
            componentConfigName: CELL_CONFIG_NAME
        }
    }
};

export const GridConfig = {
    meta: {
        id: GRID_CONFIG_NAME,
        namePrefix: 'Grid',
        label: 'Grid',
        icon: 'grid',
        isAttribute: true,
        uiManager: UIManager.LAYOUT_BUILDER
    },
    properties: {
        name: {
            type: 'string',
            name: 'Label',
            required: false,
        },
    },
    subComponents: {
        rows: {
            componentConfigName: ROW_CONFIG_NAME
        }
    }
   
};



const LayoutConfigurations = [
    LayoutConfig, 
    GridConfig, 
    RowConfig,
    ColumnConfig, 
    CellConfig, 
    ContentUnitConfig,
    AttibuteConfig,
    AttibuteLabelConfig,
    AttibuteValueConfig
];
export default LayoutConfigurations;