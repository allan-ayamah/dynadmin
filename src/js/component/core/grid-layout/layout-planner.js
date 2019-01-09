import React, { useState, createElement } from "react";
import { _cloneDeep, _forEach } from "js/common/utils"
import { 
    GRID_CONFIG_NAME, 
    ROW_CONFIG_NAME, 
    COLUMN_CONFIG_NAME, 
    LAYOUT_CONFIG_NAME, 
    CONTENT_CONFIG_NAME,
    ATTIBUTE_CONFIG_NAME,
    ATTRIBUTE_LABEL_CONFIG_NAME,
    ATTRIBUTE_VALUE_CONFIG_NAME, 
    CELL_CONFIG_NAME
} from "./default-layout-config";

import "./layout-planner.css";
import { Action, UIManager } from "js/common/constants";
import GridView from "./grid-view";



const REF_ID_PEFIX = "l_pnr_";
const getRefId = function(actualId) {
    return `${REF_ID_PEFIX}${actualId}`
}

const MAX_ROW_CELLS = 6;

function Grid(props) {
    const cells = props.children;
    return (
        <div className={"row"}>
            {cells}
        </div>
    );
}

function Cell(props) {
    return (
        <div className="col-sm">
            {props.children}
        </div>
    ) 
}

function SomeElement(props) {
    return (
        <span>{props.content}</span>
    );
}

export default class LayoutPlanner extends React.Component {
    constructor(props) {
        super(props);
       const { model, pageId } = props;
       
        this.state = {
            gridId: null,
            jsPlumb: null,
        }
    }


    componentDidMount(){
        this.doInit();
    }


    doInit = () => {
        const mgr = this.props.model.mgr;
        const pageHelper = this.props.model.componentHelper(this.props.pageId)
        if(!pageHelper.isPage()) {
            return;
        }
        
        let uniqueLayoutElement = null;
        pageHelper.forEachSubcomponent((l) => {
            uniqueLayoutElement = l;
        }, ["layout"]);
        if(uniqueLayoutElement === null) {
            uniqueLayoutElement = mgr.createElement(this.props.model, this.props.pageId, LAYOUT_CONFIG_NAME);
            const uniqueGrid = mgr.createElement(this.props.model, uniqueLayoutElement.id, GRID_CONFIG_NAME);
            this.initGrid(uniqueGrid);
            
            this.props.dispath({
                type: Action.CREATED,
                caller: UIManager.LAYOUT_BUILDER
            }, { componentId: uniqueLayoutElement.id })
            this.setState({ initialised: true, gridId: uniqueGrid.id, grid: uniqueGrid })  
        } else {
            const helper = this.props.model.componentHelper(uniqueLayoutElement.id);
            let uniqueGrid = null;
            helper.forEachSubcomponent((g) => {
                uniqueGrid = g;
            })
            this.setState({ initialised: true, gridId: uniqueGrid.id })  
        }
        
    }

    pageContents = () => {
        if(!this.state.initialised)
            return null;
        const pageHelper = this.props.model.componentHelper(this.props.pageId);
        const contents = [];
        const _this = this;
        const model = this.props.model;
        pageHelper.forEachSubcomponent((unitComp) => {
            const unitHelper = model.componentHelper(unitComp.id);
            const attributesEl = []
            if(unitHelper.config.meta.isFormComponent
                || unitHelper.config.meta.isSingleDataUnit) {
                unitHelper.forEachSubcomponent((attribute) => {
                    if(model.componentHelper(attribute.id).isLink()) return;
                    const attrRefId = getRefId(attribute.id) 
                    attributesEl.push(
                        <li key={attrRefId} id={attrRefId} 
                            className={"attr"}
                            onDoubleClick={ (e) => 
                                _this.handleAddContent(e, ATTIBUTE_CONFIG_NAME, unitComp.id, attribute.id)
                            }
                            >
                            <span>{attribute.name}</span>
                            <ul style={{"margin": "3px 5px"}}>
                                <li className={"attrLabel"}
                                    onDoubleClick={ (e) => 
                                        _this.handleAddContent(e, ATTRIBUTE_LABEL_CONFIG_NAME, unitComp.id, attribute.id)
                                    }
                                >
                                    <span>{"label"}</span>
                                </li>
                                <li className={"attrValue"}
                                    onDoubleClick={
                                        (e) => 
                                        _this.handleAddContent(e, ATTRIBUTE_VALUE_CONFIG_NAME, unitComp.id, attribute.id)
                                    }
                                >
                                    <span>{"value"}</span>
                                </li>
                            </ul>
                        </li>
                    )
                }) 
            }
            const unitRefId = getRefId(unitComp.id); 
            let contentEl = null;
            if(attributesEl){
                contentEl = (
                    <li key={unitRefId} id={unitRefId} 
                        onDoubleClick={(e) => 
                            this.handleAddContent(e, CONTENT_CONFIG_NAME, unitComp.id)
                        }>
                        <span>{unitComp.name}</span>
                        <ul style={{"margin": "3px 5px"}}>{attributesEl}</ul>
                    </li>
                )
            } else {
                contentEl = (
                    <li key={unitRefId} id={unitRefId}
                        onDoubleClick={(e) => 
                            this.handleAddContent(e, CONTENT_CONFIG_NAME, unitComp.id)
                        }>
                        <span>{unitComp.name}</span>
                    </li>
                )
            }
            contents.push(contentEl)
        }, ["unitComponents"]);
        if(contents.length) {
            return React.createElement("ul", null, contents);
        }
        return contents;
    }

    
    initGrid = (gridElement) => {
        const mgr = this.props.model.mgr;
        for(let r = 0; r < 6; r++) {
            this.addRow(gridElement.id);
        }
    }

    addRow = (gridId) => {
        const model = this.props.model;
        const row =  model.createComponent(ROW_CONFIG_NAME, gridId);
        for(let c = 0; c < MAX_ROW_CELLS; c++) {
            const cell = model.createComponent(CELL_CONFIG_NAME, row.id);
            cell.colSpan = 1;
            cell.rowSpan = 1;
        }
        return row; 
    }

    handleAddRow = (evt) => {
        const row = this.addRow(this.state.gridId);
        this.props.dispath({
            type: Action.CREATED,
            caller: UIManager.LAYOUT_BUILDER,
        }, { componentId: row.id })
    }

    handleRemoveRow = (evt) => {
        // @to-do 
        const gridHelper = this.props.model.componentHelper(this.state.gridId);
        //REMOVE LAST
        let lastRowIndex = null;
        let lastRowId = null; 
        gridHelper.forEachSubcomponent((row) => {
            if((lastRowId == null) || (row.id > lastRowIndex)) {
                lastRowIndex = row.id;
                lastRowId = row.id;
            }
        });

        this.props.dispath({
            type: Action.DELETE,
            caller: UIManager.LAYOUT_BUILDER,
        }, { componentId: [lastRowId] })
    }

    handleAddContent = (e, configName, unitId, attibuteId) => {
        e.stopPropagation();
        const model = this.props.model;
        const gridId = this.state.gridId;
        const gridHelper = model.getComponentHelper(gridId);
        let nextRow = null;
        const rows = gridHelper.getSubcomponents();
        for(let r = 0; r < rows.length; r++) {
            const row = rows[r];
            let isRowEmpty = true;
            const cells = model.getComponentHelper(row.id).getSubcomponents();
            for(let c = 0; c < cells.length && isRowEmpty; c++) {
                const cell = cells[c]; 
                isRowEmpty = isRowEmpty && !model.getComponentHelper(cell.id).hasSubcomponents();
            }
            if(isRowEmpty) {
                nextRow = row;
                break;
            }
        }
        if(nextRow == null) {
            nextRow = this.addRow(gridId);
        }
        const firstCell = model.getComponentHelper(nextRow.id).getSubcomponents()[0]; 
        const contentUnit = model.getComponent(unitId);
        const referenceOfUnit = this.props.model.createComponent(configName, firstCell.id);
        referenceOfUnit.unitId = unitId;
        if(attibuteId) {
            // attribute of the content unit
            // ex: Query component with output `attribute` "surname"
            referenceOfUnit.attrId = attibuteId;
            referenceOfUnit.name = model.getComponent(attibuteId).name;
        } else {
            referenceOfUnit.name = contentUnit.name;
        }
        firstCell.colSpan = referenceOfUnit.colSpan = MAX_ROW_CELLS;
        this.props.dispath({
            type: Action.CREATED,
        }, { componentId: referenceOfUnit.id } )   
    }
   

    render() {
        const gridId = this.state.gridId;
        return (
            <div className="container">
               <div className="row">
                   <div className="col-2">
                        <div className="row">
                            <div className="grid-controls">
                                <button onClick={this.handleAddRow}>Add row</button>
                                <button onClick={this.handleRemoveRow}>Remove row</button>
                            </div>
                        </div>
                        <div className="row page-contents">
                            {this.pageContents()}
                        </div>
                   </div>
                   <div className="col-10">
                       {gridId && <GridView key={gridId} gridId={gridId} 
                       {...this.props}
                       getRefId={getRefId}/>}
                   </div>
               </div>
            </div>
        )
    }
}