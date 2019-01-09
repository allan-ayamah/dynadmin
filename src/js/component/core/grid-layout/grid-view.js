import React from "react";
import { Action, UIManager } from "js/common/constants";

export default function GridView(props) {
    const { gridId, model } = props;
    const gridHelper = model.getComponentHelper(gridId);
    const rElements = []
    let cellCount = 1;
    gridHelper.forEachSubcomponent((row) => {
        const rowHelper = model.getComponentHelper(row.id);
        const cells = rowHelper.getSubcomponents();
        const cellElements = [];
        let remainingCol = 6;
        for(let i = 0; i < cells.length; i++){
            const cell = cells[i];
            if(remainingCol > 0) {
                let cellTitle = cell.name;
                const cellHelper = model.getComponentHelper(cell.id);
                let uniqueContent = null;
                cellHelper.forEachSubcomponent((cnt) => {
                    uniqueContent = cnt;
                });
                let componentId = cell.id;
                if(uniqueContent !== null) {
                    cellTitle = uniqueContent.name;
                    componentId = uniqueContent.id;
                }
                cellElements.push(React.createElement("div", {
                    key: i, 
                    id: props.getRefId(cell.meta.localId), 
                    className: `col col-${cell.colSpan * 2}`,
                    onClick: (e) => {
                        e.stopPropagation();
                        props.dispath({
                            type: Action.FOCUS,
                            caller: UIManager.LAYOUT_BUILDER,
                        }, { event: e, componentId: componentId })
                    },
                }, cellTitle));
                remainingCol -= cell.colSpan;
                cellCount++;
            } else {
                cell.colSpan = 1;
            }
        }
        rElements.push(React.createElement("div", {
            key: cellElements.length,
            id: props.getRefId(row.meta.localId), 
            className: "row grid-row"
        }, cellElements));
    }, ["rows"]);

    return React.createElement("div", {
        key: cellCount,
        className: "grid-view container"
    }, rElements);
}