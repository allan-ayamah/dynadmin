
import React from 'react';
import { clone } from '../../common/helpers'
import { Action as ElementAction} from '../../component/constants'  
import { 
    MODEL_CONFIG_NAME, 
    PAGE_CONFIG_NAME, 
    FLOW_CONFIG_NAME 
} from '../core/default-config';

import { StageItemEvent, makeStageItem } from './stage-item/stage-item';
import { StageItemType } from './stage-item/index'

const StageAction = Object.assign(ElementAction, {
    MOVE: 'move',
    NONE: '',
})

function getStageItemTypeByConfigName(componentConfigName){
    switch(componentConfigName) {
        case MODEL_CONFIG_NAME: 
            return StageItemType.ContainerType;
        case PAGE_CONFIG_NAME: 
            return StageItemType.ContainerType
        case FLOW_CONFIG_NAME:
            return StageItemType.FlowType
        default:
            return StageItemType.ComponentType
    }
}

const STAGE_ITEM_ID_PREFIX = 'dyn_stage_i_';
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

        this.ref = React.createRef(STAGE_CANVAS_REF_NAME);
        this.stageItems = {};
        this.flows = {}
        this.state = {
            stageAction: StageAction.NONE,
            stageItem: null,
            isMouseDown: false,
            isMove: false,
            mouseDownPosX: 0,
            mouseDownPosY: 0,
        }
    }

    componentDidMount() {
        console.log(`${this.ref.current.id} Stage mounted`, this.ref.current)
        Object.keys(this.stageItems).forEach(id => {
            if(!this.stageItems[id].ref.current) {
                alert(`${id} My reference is NULL`)
            }
        })
        setTimeout(() => {
            const flowIds = Object.keys(this.flows);
            flowIds.forEach( id => {
                const flowData = this.model.get(id);
                const srcStageItem = this.stageItems[flowData.source].ref.current;
                const trgStageItem = this.stageItems[flowData.target].ref.current;
                const srcRect = srcStageItem.getRect();
                alert(`Source RECT ${srcRect.y} ${srcRect.top} ${srcRect.x} ${srcRect.left}`)
                const trgRect =  trgStageItem.getRect();
                this.stageItems[id].ref.current.connect(srcRect, trgRect);
            })
        }, 100)
    }

    componentWillUnmount() {
        alert("Stage is unmounting")
        delete this.stageItems;
    }

    shouldComponentUpdate(nextProps, nextState) {
        const appAction = nextProps.action;
        if(appAction) {
            // alert(`App action: ${appAction}`)
            const actionData = nextProps.actionData;
            
            switch(appAction) {
                case StageAction.EditProps: {
                    const dataId = actionData.id;
                    const data = actionData.data
                    let stageItem = this.stageItems[dataId];
                    alert(`Action ${actionData} of ${dataId}`)
                    if(stageItem) {
                        // alert(`Edit ${dataId}`)
                        stageItem.ref.current.setState({
                            name: actionData.data.name,
                        })
                    } else {
                        // Add new Element
                        // alert("NEw")
                        if(this.props.mgr.isStageElement(data)) {
                            const dataId = actionData.id;
                            const parentId = this.mgr.parentIdOf(this.props.model, dataId);
                            const itemRef = this.getStageItemRef(dataId, parentId);
                            const stageItem = this.createStageItem(data, itemRef);
                            itemRef.parentRef.current.addChildren(stageItem)
                        }
                    }
                    break;
                }
                default:
                break;
            }
            // alert("Component should not update")
            return false;
        }
        
        return false;
        if([StageAction.MOVE].includes(nextState.stageAction)) {
           
            return false;
        }
        return true;
    }

    componentDidUpdate(prevProps, prevState) {
        alert(`componentDidUpdate ${prevState.stageItemId} ${this.state.stageItemId}`)
    }


    handleStageItemNotification(id, event, data, prevState) {
        console.log(`Incoming notification from ${id}, eventType: ${event}`, data)

        if([StageItemEvent.MOVED, StageItemEvent.RESIZE].includes(event)) {
            this.mgr.updateComponentPos(this.model, id, data);
            if(data.eventData) {
                const childrenUpdate = data.eventData.childrenUpdate;
                if(childrenUpdate) {
                    childrenUpdate.forEach(chUpdate => {
                        const childId = chUpdate.who;
                        const childRef = this.stageItems[childId].ref;
                        console.log(chUpdate)
                        alert(`Update child ${childId}, DATA : ${chUpdate.data.top}, parent: ${this.stageItems[childId].parentRef.current.getTop()}`)
                        childRef.current.handleEvent(chUpdate.event, chUpdate.data);
                    })
                }
            }
            const stageItem = this.stageItems[id];
            const parentRef = stageItem.parentRef;
            if(parentRef) {
                const updateData = {
                    childId: id,
                    prevState: prevState,
                    currState: data,
                }
                parentRef.current.handleEvent(StageItemEvent.CHILD_MOVED, updateData);
            } else {
                // ROOT
                let currY = stageItem.ref.current.getTop();
                let currX = stageItem.ref.current.getLeft()
                const reset = {
                    top: currX,
                    left: currY
                }

                if(currX < 0) {
                    reset.left = 0;
                }
                if(currY < 0) {
                    reset.top = 0; 
                }
                if(currY !== reset.top || currX !== reset.left) {
                    stageItem.ref.current.handleEvent(StageItemEvent.UPDATE_COORDINATES, reset);
                }
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
        const childRef = this.stageItems[childId].ref.current;
        // Root ELement(Model)
        if(this.stageItems[childId].parentRef === null ||
            this.stageItems[childId].parentRef === undefined) {
            return childRef.handleEvent(StageItemEvent.UPDATE_POSITION, nextCoord);
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

        childRef.handleEvent(StageItemEvent.UPDATE_POSITION, actualChildNextCoord);
        if(parentNeedsToShift){
            this.handleStageItemMove(parentRef.props.id, parentNewCoord);
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
        return this.process(modelData, 1, null)
    }


    process(data, currLevel, parentId){
        const mgr = this.props.mgr;
        const tree = {
            components: [],
            flows: [],
        }
        if(data.id) {
            const children = this.mgr.findElements(data, (childData) => {
                //console.log(`Check stage element for ${data.id}`, this.props.model)
                return this.mgr.isStageElement(childData) && !mgr.isFlowElement(childData)
            });

            const itemRef = this.getStageItemRef(data.id, parentId);
            if(children.length == 0) {
                tree.components.push(this.createStageItem(data, itemRef));
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
                const stageItem = this.createStageItem(data, itemRef, childItems.components)
                tree.components.push(stageItem);
                tree.flows.push(childItems.flows)
            }

            const flowChildren = this.mgr.findElements(data, (childData) => {
                return mgr.isFlowElement(childData)
            });

            if(flowChildren.length) {
                flowChildren.forEach(flowData => {
                    const flowRef = this.getStageItemRef(flowData.id, data.id);
                    this.flows[flowData.id] = flowRef;
                    tree.flows.push(this.createStageItem(flowData, flowRef))
                })
            }
            
        }
        return tree;
    }


    createStageItem = (data, itemRef, childItems) => {
        const id = data.id;
        const name = data.name;
        const widgetProps = {
            key: id,
            id,
            name,
        }
        
        const style = { 
            position: 'absolute', 
            top: data.meta.top,
            left: data.meta.left,
            minWidth: data.meta.minWidth,
        } 

        const compConfigName = this.mgr.getConfigName(data);

       
        const DynComponentStageItemType = getStageItemTypeByConfigName(compConfigName);

        if(compConfigName === FLOW_CONFIG_NAME) {
            return <DynComponentStageItemType 
                ref={itemRef}
                id={id}
                key={id}
                style={style}
                isContainer={isContainerItem}
                itemProps={widgetProps}
                data={data}
                children={childItems}
                notifyEvent={(evt, evtData) => this.handleStageItemNotification(id, evt, evtData)}
            />
        }
        const StageItem = makeStageItem(
            DynComponentStageItemType, 
            {
                onMouseDown: (e) => this.handleMouseDown(e, id),
                onMouseMove: (e) => this.handleMouseMove(e, id),
                onMouseUp: (e) => this.handleMouseUp(e, id),
                onDragBegin: (e) => this.handleDragBegin(e, id),
                onDrag: (e) => this.handleDrag(e, id),
                onDragEnd: (e) => this.handleDragEnd(e, id),
                draggable:true,
            }
        );
        const isContainerItem = this.mgr.isContainerElement(data)
        const stageItem = (
            <StageItem 
                ref={itemRef}
                id={id}
                key={id}
                style={style}
                isContainer={isContainerItem}
                itemProps={widgetProps}
                data={data}
                children={childItems}
                notifyEvent={(evt, evtData) => this.handleStageItemNotification(id, evt, evtData)}
            />
        );
        return stageItem;
    }

    getStageItemRef = (dataId, parentId) => {
        const parentRef = parentId ? this.stageItems[parentId].ref : null
        const ref = React.createRef()
        this.stageItems[dataId] = {
            ref: ref,
            parentRef: parentRef
        }
        return this.stageItems[dataId].ref;
    }
    
    render() {
        const modelData = this.props.model.data;
        const tree = this.createTree(modelData)
        if(!tree.flows.length) {
            alert('NO flows')
        }
        return (
            <>
                {tree.flows}
                <div style={ {position: 'absolute', width:'200%', height:'200%' } }
                    ref={this.ref} 
                    onMouseMove={(e) => this.handleMouseMove(e, 'STAGE')}
                    onMouseUp={(e) => this.handleMouseUp(e, 'STAGE')}
                    onDragBegin={(e) => this.handleDragBegin(e, 'STAGE')}
                    onDrag={(e) => this.handleDrag(e, 'STAGE')}
                    onDragEnd={ (e) => this.handleDragEnd(e, 'STAGE')}
                    draggable={true}
                >
                    {tree.components}
                </div>
            </>
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