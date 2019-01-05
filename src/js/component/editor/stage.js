import { jsPlumb } from "jsplumb";
import { jsPlumbConfig } from './stage-config'

import React from 'react';
import ReactDOM from 'react-dom'
import { clone, isEqual } from '../../common/helpers'
import { Action as ElementAction, Action} from '../../component/constants'  
import { 
    MODEL_CONFIG_NAME, 
    PAGE_CONFIG_NAME, 
    FLOW_CONFIG_NAME 
} from '../core/default-config';

import { StageItemEvent, makeStageItem } from './stage-item/stage-item';
import { StageItemType } from './stage-item/index'

import '../../../css/jsplumbtoolkit-defaults.css'

const StageAction = Object.assign(ElementAction, {
    MOVE: 'move',
    NONE: 'NONE',
});



function getStageItemType(compHelper){
    if(compHelper.isLink()) {
        return StageItemType.FlowType
    }
    if(compHelper.isUnitComponent()) {
        return StageItemType.ComponentType;
    }
    return StageItemType.ContainerType;
}

const STAGE_ITEM_ID_PREFIX = 'dyn_stge_i_';
const STAGE_CANVAS_REF_NAME = 'stage_canvas';

const CLICK = {
    LEFT: 1,
    RIGHT: 3,
}


const CONTAINER_HEADER_HEIGHT = 37;

const CONTAINER_OFFSET_Y = 20;
const CONTAINER_OFFSET_X = 20;

export class Stage extends React.Component {
    constructor(props) {
        super(props);
        this.mgr = props.mgr;
        this.model = this.props.model;
        this.ref = React.createRef();

        this.stageItems = {};
        this.flows = {}
        this.state = {
            isReady: false,
            jsPlumbInstance: null,
            initialised: false,
            stageAction: StageAction.NONE,
            actionData: null,
            stageItemId: null,
            stageItem: null,
            isMouseDown: false,
            isMove: false,
            mouseDownPosX: 0,
            mouseDownPosY: 0,
        }
    }

    componentDidMount() {
        console.log(`${this.ref.current.id} Stage mounted`, this.ref.current)
        jsPlumb.ready(() => {
            const jsPlumbInstance = jsPlumb.getInstance(jsPlumbConfig); 
            jsPlumbInstance.setContainer(document.getElementById(this.ref.current.id));
            this.setJsPlumbEventListeners(jsPlumbInstance);
            this.setState({
                isReady: true,
                jsPlumbInstance
            })
        })
    }

    componentWillUnmount() {
        alert("Stage is unmounting")
        delete this.stageItems;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!this.state.isReady 
            && nextState.isReady) {
            return true;
        }
        if(!this.state.initialised 
            && nextState.initialised) return false;
        
        if(nextState.stageAction !== this.state.stageAction) {
            switch(nextState.stageAction) {
                case StageAction.FLOW_DRAW_BEGIN: {
                        this.state.jsPlumbInstance.toggleDraggable(nextState.stageItemId);
                        return false;
                }
                case StageAction.FLOW_DRAW_END: {
                    this.state.jsPlumbInstance.toggleDraggable(this.state.stageItemId);
                    this.setState({
                        stageAction: StageAction.NONE,
                        actionData: null,
                        stageItemId: null,
                        stageItem: null,
                    },
                    () => {
                        const tempId = nextState.actionData.tempId;
                        //this.state.jsPlumbInstance.delde
                        this.props.notify(Action.FLOW_DRAW_END, nextState.actionData)
                    })
                    return false;
                }
                case StageAction.FLOW_DRAW_ABORT: { 
                    this.state.jsPlumbInstance.toggleDraggable(this.state.stageItemId);
                    this.setState({
                        stageAction: StageAction.NONE,
                        actionData: null,
                        stageItemId: null,
                        stageItem: null,
                    }, 
                    () => this.props.notify(Action.FLOW_DRAW_ABORT)
                    )
                    return false;
                }
                case StageAction.NONE:
                    console.log(`Restore stage state: ${nextState.stageAction} - ${this.state.stageAction}`) 
                    return false;
                default:
                    console.log(`Default state: ${nextState.stageAction}`) 
                break;
            }
        }

        // this happen when flow drawing is aborted but the stage
        // does not recieve an abor notification
        if(this.state.stageAction === StageAction.FLOW_DRAW_BEGIN) {
            this.state.jsPlumbInstance.toggleDraggable(this.state.stageItemId);
            this.setState({
                stageAction: StageAction.NONE,
                actionData: null,
                stageItemId: null,
                stageItem: null,
            });
        }

        switch(nextProps.action) {
            case Action.FLOW_DRAW_BEGIN: {
                if(this.state.stageAction ===  StageAction.FLOW_DRAW_BEGIN)
                    return false;
                const actionData = nextProps.actionData;
                const expectedStageId = this.createStageId(actionData.source);
                if(!this.isStageItem(expectedStageId)) {
                    throw new Error(`Data[${ actionData.sour}] is not present on stage`);
                }
                const sourceStageItem = this.getStageItem(expectedStageId)
                this.setState({
                    stageAction: StageAction.FLOW_DRAW_BEGIN,
                    actionData: actionData,
                    stageItemId: sourceStageItem.ref.current.getStageId(),
                    stageItem: sourceStageItem,
                })
                return false;
            }
            case Action.FLOW_DRAW_ABORT: { 
                if(this.state.stageItemId)
                    this.state.jsPlumbInstance.toggleDraggable(this.state.stageItemId);
                this.setState({
                    stageAction: StageAction.NONE,
                    actionData: null,
                    stageItemId: null,
                    stageItem: null,
                })
                return false;
            }
            case Action.EditProps: {
                const dataId = nextProps.actionData.id;
                const compHelper = this.model.getComponentHelper(dataId);
                const data = nextProps.actionData.data;
                const expectedStageId = this.createStageId(dataId)
                if(this.isStageItem(expectedStageId)) {
                    this.updateStageItemData(expectedStageId, data)
                    return false;  
                }
                if(compHelper.isStageComponent()) {
                    // alert("Create new item")
                    const instance = this.createStageItem(data);
                    if(compHelper.isLink()) {
                        console.log(`INIt NEW FLOW`, data);
                        this.initFlow(instance.stageId);
                        this.state.jsPlumbInstance.repaintEverything();
                    } else {
                        this.mountStageItem(instance.component, instance.stageId);
                    }
                    
                }
                return false;
            }
            default:
            break;
        }

        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("STAGE DID UPDATE", this.stageItems)

        if(this.state.isReady && !this.state.initialised) {
            this.state.jsPlumbInstance.setSuspendDrawing(true);
            const stageItemKeys = Object.keys(this.stageItems);
            stageItemKeys.forEach(itemKey => {
                this.initStageItem(itemKey)
            })

            // INIT FLOWS
            const flowIds = Object.keys(this.flows);
            flowIds.forEach( id => {
                this.initFlow(id);
            })
            this.state.jsPlumbInstance.setSuspendDrawing(false, true);
            this.setState({
                initialised: true,
            });
        }
        
    }


    setJsPlumbEventListeners = (j) => {
        const _this = this;
        
        j.bind("click", (c) =>{
            _this.props.handleElementClick(c.getData().dataId)
        })
        const _appendEvent = (f, s) => {
            console.log(f, s)
        }

        
        j.bind("drag", function(p) {
            console.log("ACTUAL DRAG", p)
        })

        j.bind("beforeDrag", function(p) {
            const { source, target } = p;
            console.log("BEFORE DRAg", p)
        })

        j.bind("beforeDrop", function(p) {
            const { source, target } = p;
            const conId = p.connection.id;
            // @todo check if target can accept the flow
            console.log("Connection before drop", p)
            
            return true;
        })

        j.bind("connectionAborted", (p) => {
           alert('SEND abort', p)
            _this.setState({
                stageAction: StageAction.FLOW_DRAW_ABORT,
            })
        })

        j.bind("connection", function(p) {
            if(_this.state.stageAction === StageAction.FLOW_DRAW_BEGIN) {
                const newActionData = clone(_this.state.actionData);
                newActionData.source = _this.resolveDataId(p.source.id);
                newActionData.target = _this.resolveDataId(p.target.id);
                // delete transient connection
                // the real one will be created later
                _this.state.jsPlumbInstance.deleteConnection(p.connection);
                _this.setState({
                    stageAction: StageAction.FLOW_DRAW_END,
                    actionData: newActionData
                })
                return;
            }

            p.connection.bind("dblclick", (c) => {
                console.log("DB C", c.getData())
                _this.props.onInitDataBinding(c.getData().dataId)
            });
        });


        j.bind("group:addMember", function(p) {
            _appendEvent("group:addMember", p.group.id + " - " + p.el.id);
        });
        j.bind("group:removeMember", function(p) {
            _appendEvent("group:removeMember", p.group.id + " - " + p.el.id);
        });
        j.bind("group:expand", function(p) {
            _appendEvent("group:expand", p.group.id);
        });
        j.bind("group:collapse", function(p) {
            _appendEvent("group:collapse", p.group.id);
        });
        j.bind("group:add", function(p) {
            _appendEvent("group:add", p.group.id);
        });
        j.bind("group:remove", function(p) {
            _appendEvent("group:remove", p.group.id);
        });

        j.bind("addNewConnection", function(e) {
            alert("fire add new connection")
        })

        jsPlumb.fire("addNewConnection", j);
    }


    handleStageItemNotification(stageId, event, data, prevState) {
        console.log(`Incoming notification from ${stageId}, eventType: ${event}`, data)
        switch(event) {
            case StageItemEvent.READY: {
                if(!this.state.initialised) return;
                alert(`INIT ${stageId}`)
                setTimeout(() =>{
                    this.initStageItem(stageId);
                }, 100)
                break;
            }
        }
        if([StageItemEvent.UPDATE_POSITION, 
            StageItemEvent.RESIZE, 
            StageItemEvent.MOVED].includes(event)) {
            const stageItem = this.getStageItem(stageId);
            this.mgr.updateComponentPos(this.model, this.resolveDataId(stageId), data);
            if(stageItem.parentRef) {
                console.log(`Call revalidate on ${stageItem.parentRef.current.getStageId()}`)
                this.state.jsPlumbInstance.revalidate(stageItem.parentRef.current.getStageId())   
            }
        }
    }

    handleMouseDown = (e, id) => {
        e.stopPropagation();
        console.log(`StageItem ${id} mouse down`)
        
        if(this.state.stageAction == StageAction.NONE) {
            console.log(`StageItem ${id} HAS FOCUS`)
            const stageItem = this.stageItems[id];
            this.setState(
                {
                    stageAction: StageAction.MOVE,
                    stageItem: stageItem,
                    isMouseDown: true,
                    mouseDownPosX: e.clientX,
                    mouseDownPosY: e.clientY,
                    isMove: false,
                },
                () => {} //this.props.handleElementClick(id)
            );
        } 
    }

    handleMouseMove = (e, targetId) => {
        e.stopPropagation();
        if(this.state.stageAction === StageAction.MOVE) {
            if(this.state.isMouseDown && !this.state.isMove) {
                console.log('call drag')
                this.setState({
                    isMove: true,
                })
            }
            
        }
    }

    handleMouseUp = (e, targetId) => {
        e.stopPropagation();
        const currentAction = this.state.stageAction;
        if(currentAction !== StageAction.NONE) {  
            switch(currentAction) {
                case StageAction.MOVE: {
                    if(this.state.isMouseDown && this.state.isMove) {
                        console.log('CALL DRAG END')
                        const moveDeltaX = e.clientX - this.state.mouseDownPosX;
                        const moveDeltaY = e.clientY - this.state.mouseDownPosY;
                        const stageItem = this.state.stageItem.ref.current;
                        const expectedNextCoord = nextCoordinates(stageItem.getLeft(), stageItem.getTop(), moveDeltaX, moveDeltaY);
                        this.handleStageItemMove(stageItem.props.id, expectedNextCoord)
                        this.cleanup(StageAction.MOVE)
                    }
                    break;
                }
            }
        }
    }

    /**
     * 
     * @todo resize container when it's children move innerwards leaving
     * the container too big
     */
    handleStageItemMove = (childId, nextCoord) => {
        console.log(`${childId} FIX COORDINATE`, nextCoord)
        const childRef = this.stageItems[childId].ref.current;
        // Root ELement(Model)
        if(this.stageItems[childId].parentRef === null ||
            this.stageItems[childId].parentRef === undefined) {
            return childRef.updatePosition(nextCoord);
        }

        const childRect = childRef.getRect();
        const actualChildNextCoord = Object.assign(clone(nextCoord), {
            minHeight: nextCoord.minHeight || childRef.getMinHeight() || childRect.height,
            minWidth: nextCoord.minWidth || childRef.getMinWidth() || childRect.width,
        });

        const parentRef = this.stageItems[childId].parentRef.current;
        const parentRect = parentRef.getRect();
        const parentNewCoord = {
            top: parentRef.getTop(),
            left: parentRef.getLeft(),
            minHeight: parentRef.getMinHeight() || parentRect.height,
            minWidth: parentRef.getMinWidth() || parentRect.width,
        };

        let parentNeedsToShift = false;
        // check y overflow negative
        if(nextCoord.top < 0) {
            parentNewCoord.top-= Math.abs(nextCoord.top);
            actualChildNextCoord.top = 0;
            parentNeedsToShift = true;
        } 

        if(nextCoord.left < 0) {
            parentNeedsToShift = true;
            parentNewCoord.left-= Math.abs(nextCoord.left);
            actualChildNextCoord.left = 0;
        }
        const expectedH = actualChildNextCoord.minHeight + Math.abs(actualChildNextCoord.top) 
                        + CONTAINER_OFFSET_Y + CONTAINER_HEADER_HEIGHT;
        // check y overflow positive
        if(parentNewCoord.minHeight < expectedH) {
            parentNeedsToShift = true;
            parentNewCoord.minHeight = expectedH;
        } 

        const expectedW = Math.abs(actualChildNextCoord.left) + actualChildNextCoord.minWidth  + CONTAINER_OFFSET_X;
        // check x overflow positive
        if(parentNewCoord.minWidth < expectedW) {
            parentNeedsToShift = true;
            parentNewCoord.minWidth = expectedW;
        }

        childRef.updatePosition(actualChildNextCoord);
        if(parentNeedsToShift) {
            console.log(`Parent[${parentRef.getStageId()}] of ${childId} new COORD`, parentNewCoord)
            this.handleStageItemMove(parentRef.getStageId(), parentNewCoord) 
        }
    }

    handleDragBegin = (e, targetId) => {
        //alert("Drag begin")
        return this.handleMouseMove(e, targetId);
    }

    handleDrag = (e, targetId) => {
        //alert(`DRAGGIN ${targetId}`)
        return this.handleMouseMove(e, targetId);   
    }

    
    handleDragEnd = (e, targetId) => {
        console.log(targetId, this.state)
        //alert("Drag end")
        return this.handleMouseUp(e, targetId);   
    }


    cleanup(action) {
        switch(action) {
            case StageAction.MOVE:{
                this.setState({
                    stageAction: StageAction.NONE,
                    stageItem: null,
                    isMouseDown: false,
                    isMove: false,
                });
                break;
            }
        }
    }

    handlePosChange = (id, left, top) => {
        this.mgr.updateComponentPos(this.model, id, left, top);
    }


    createTree(modelData) {
        if(!this.state.isReady) {
            return {
                flows: [],
                components: []
            }
        }
        return this.process(modelData, 1, null)
    }


    process(data, currLevel, parentId){
        const mgr = this.props.mgr;
        const tree = {
            components: [],
            flows: [],
        }
        if(data.id) {
            const children = []
            const flowChildren = [];
            const helper = this.model.getComponentHelper(data.id);
            const _this = this;
            helper.forEachSubcomponent((subComponent) => {
                const subHelper = this.model.getComponentHelper(subComponent.id);
                if(subHelper.isLink()) {
                    flowChildren.push(subComponent)
                } else if(subHelper.isStageComponent()) {
                    children.push(subComponent);
                } 
            })

            const stageId = this.createStageId(data.id);
            const itemRef = this.getStageItemRef(data.id, parentId)
            if(children.length == 0) {
                const newComponent = this.createComponentStageItem(stageId, data, itemRef, currLevel)
                tree.components.push(newComponent);
            } else {
                const nextLevel = currLevel + 1;
                const childItems = {
                    components: [],
                    flows: [],
                }
                children.forEach( childEl => { 
                    const result = this.process(childEl, nextLevel, data.id);
                    childItems.components.push(...result.components)
                    childItems.flows.push(...result.flows)
                });
                tree.flows.push(childItems.flows)
                const stageItem = this.createComponentStageItem(stageId, data, itemRef, currLevel, childItems.components)
                tree.components.push(stageItem);
            }

            if(flowChildren.length) {
                flowChildren.forEach(flowData => {
                    this.createStageItem(flowData);
                })
            }
            
        }
        return tree;
    }

    /**
     * Checks if the element id is already on stage
     * @param {String} id --the id of the element
     */
    isStageItem(id) {
        let stageId = id;
        if(!id.startsWith(STAGE_ITEM_ID_PREFIX)) {
            stageId = this.createStageId(id);
        }
        return  this.flows[stageId] 
            || this.stageItems[stageId] ?  true : false
    }

    createStageId = (id) => {
        return STAGE_ITEM_ID_PREFIX + id.split(".").join("_");
    }
    
    resolveDataId = (stageId) => {
        const parts = stageId.split(STAGE_ITEM_ID_PREFIX);
        const result = parts[1].split("_").join(".");
        console.log(`Resolved ${stageId} -> ${result} , ${parts.length}`)
        return result;
    }

    createStageItem(data, children) {
        const stageId = this.createStageId(data.id);
        const compHelper = this.model.getComponentHelper(data.id);
        if(compHelper.isLink()) {
            return this.flows[stageId] = {
                stageId,
                data,
                dataId: data.id,
            }
        }
        let parentDataId = this.props.mgr.parentIdOf(this.model, data.id);
        console.log(`Parent Data Id: ${parentDataId}`)
        const itemRef = this.getStageItemRef(data.id, parentDataId)
        const parentRef = this.getStageItem(stageId).parentRef.current;
        const itemLevel = parentRef.getLevel() + 1;
        return {
            stageId,
            component: this.createComponentStageItem(stageId, data, itemRef, itemLevel , children)
        }      
    }

    
    createComponentStageItem = (stageId, data, itemRef, level , childItems) => {
        const id = data.id;
        const name = data.name;
        const widgetProps = {
            key: id,
            id: stageId,
            name,
        }

        const style = { 
            position: 'absolute', 
            top: data.meta.top,
            left: data.meta.left,
            minWidth: data.meta.minWidth,
        } 

        const compHelper = this.model.getComponentHelper(data.id);
        const DynComponentStageItemType = getStageItemType(compHelper);
        const StageItem = makeStageItem(DynComponentStageItemType, {});
        const isContainerItem = compHelper.isContainer();
        let children = childItems
        if(isContainerItem && (!children || !children.length)) {
            children =  [];
        }
        const stageItem = (
            <StageItem 
                ref={itemRef}
                stageId={stageId}
                id={stageId}
                key={id}
                style={style}
                isContainer={isContainerItem}
                jsPlumbInstance={this.state.jsPlumbInstance}
                itemProps={widgetProps}
                data={data}
                level={level}
                children={children}
                onClick={() => this.props.handleElementClick(data.id)}
                notifyEvent={(evt, evtData) => this.handleStageItemNotification(stageId, evt, evtData)}
            />
        );
        return stageItem;
    }

    mountStageItem = (instance, stageId) => {
        console.log(`Mount ${stageId}`)
        const item = this.stageItems[stageId];
        return item.parentRef.current.addChildren([instance])
    }

    initStageItem = (stageId) => {
        const _this = this;
        const item = this.stageItems[stageId];
        if(item) {
            const j = this.state.jsPlumbInstance;
            const itemRef = item.ref.current;
            const itemDOM = itemRef.getDOMNode();
            const data = {
                stageId,
                childrenStageIds: itemRef.getChildrenStageIds()
            }
            itemRef.jsPlumbObj = j.draggable(itemDOM, {
                data: data,
                start: (el) => {
                    console.log(`${stageId} Drag start`, el)
                },
                drag: (el) => {
                    console.log(`${stageId} Drag`, el)
                    _this.state.jsPlumbInstance.repaint(itemRef.getChildrenStageIds())
                    
                },
                stop: (el) => {
                    console.log('STOP DRAG', el)
                   _this.handleStageItemMove(stageId, {
                        left: el.finalPos[0],
                        top: el.finalPos[1]
                    })
                }
            });
            console.log(stageId, item.jsPlumbObj)
            j.makeSource(stageId, {
                filter: (e, el) => {
                    return _this.canStartFlow(stageId, e, el);
                }
            })
            j.makeTarget(stageId, {
                dropOptions: {
                    rank: itemRef.getLevel()
                }
            });
            return true;
        } else {
            return this.initFlow(stageId)
        }
    }

    canStartFlow(stageItemId, e, el) {
        if(!(this.state.stageAction === StageAction.FLOW_DRAW_BEGIN
            && this.state.stageItemId === stageItemId)) {
            return false;
        }

        return true;
    }

       // @todo implement update stage Item id
    updateStageItemData = (stageId, data) => {
        const item = this.getStageItem(stageId);
        if(item){
            item.ref.current.updateData(data);
        }
        
    }

    getStageItem = (stageId) => {
        return this.stageItems[stageId];
    }

    getStageItemByDataId = (dataId) => {
        return this.stageItems[this.createStageId(dataId)];
    }

    getStageItemRef = (dataId, parentId) => {
        const stageId = this.createStageId(dataId);
        let parentRef = null;
        if(parentId) {
            const expectedParentStageId = this.createStageId(parentId);
            // ROOT ELEMENT (MODEL)
            console.log(`${stageId} is child of ${expectedParentStageId}, ${parentId}`)
            if(expectedParentStageId !== stageId) {
                parentRef = this.stageItems[expectedParentStageId].ref
            }
        }
        const ref = React.createRef()
        this.stageItems[stageId] = {
            ref: ref,
            parentRef: parentRef
        }
        return this.stageItems[stageId].ref;
    }  

    initFlow = (stageId) => {
        const stageFlow = this.flows[stageId];
        const flowData = this.model.getComponent(stageFlow.dataId);
        const helper = this.model.getComponentHelper(flowData.id);
        const srcStageItem = this.getStageItemByDataId(flowData.source).ref.current
        const trgStageItem = this.getStageItemByDataId(flowData.target).ref.current
        const srcId = srcStageItem.getStageId()
        const trgId = trgStageItem.getStageId();

        let paintStyle = { 
            stroke: "black",
        }
        if(helper.isOKLink()) {
            paintStyle = {
                stroke : "green"
            }
        } else if(helper.isKOLink()) {
            paintStyle = {
                stroke : "red",
            }
        }

        this.state.jsPlumbInstance.connect({
            id: stageId,
            source: srcId, 
            target: trgId,
            paintStyle: paintStyle,
        }, 
        { 
            data: {
                stageId,
                dataId: flowData.id
            }    
        });

        //stageFlow.jsPlumbConnectionId = stageFlow.jsPlumbConnection
        //console.log("CONNECT" + stageFlow.jsPlumbConnectionId, stageFlow.jsPlumbConnection)
    }
    
    render() {
        const tree = this.createTree(this.props.model.getData())
        return (
            <div>
                <div 
                    ref={this.ref} 
                    id={STAGE_CANVAS_REF_NAME} 
                    style={ {position: 'absolute', width:'200%', height:'200%' } }
                >
                    {tree.components}
                </div>
            </div>
        );
    }
}


function nextCoordinates(currX, currY, mouseDeltaX, mouseDeltaY){
    let topBefore = currY;
    let leftBefore = currX;

    let newTop, newLeft;
    // Move up
    if(mouseDeltaY < 0) {
        newTop = topBefore - Math.abs(mouseDeltaY);
    } else {
        newTop = topBefore + Math.abs(mouseDeltaY)
    }

    //Moved left
    if(mouseDeltaX < 0 ) {
        newLeft = leftBefore - Math.abs(mouseDeltaX); 
    } else {
        newLeft = leftBefore + Math.abs(mouseDeltaX); 
    }

    return {
        top: newTop,
        left: newLeft,
    }
}


function createDynComponent(props) {
    let wrapClassName = `card ${props.className} widget-container `; 
    if(props.selected) {
        wrapClassName+=`--selected`
    }

    /*const wrap = document.createElement('div');
    wrap.setAttribute('id', props.stageId);
    wrap.setAttribute("class", props.className);

    const titleDiv = document.createElement("div");
        titleDiv.setAttribute("class", "title");
        titleDiv.innerHTML="Form 2 title";
        form2.appendChild(titleDiv);
        form2.setAttribute("style", "left:50px; top:35px");


        page1.appendChild(form2)

        j.draggable(form2)
        j.connect({source:form1, target:form2});
        console.log("Click on page component", e)
    });*/


    return (
        <div style={props.style} className={wrapClassName}>
            <div className='widget-header card-header' style={{ padding: '6px' }}>
                <header>
                    <div className="widget-name">{props.name}</div>
                </header>
            </div>
            <div className='widget-content card-body' style={{position: 'relative'}}>
                {props.children}
            </div>
        </div>
    );
}
