
import React from 'react';
import ReactDOM from 'react-dom';
import { StageItemEvent, makeStageItem } from './stage-item';
import { clone } from '../../common/helpers'


const StageAction = {
    MOVE: 'move',
    NONE: '',
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
        console.log(this.stageItems)
    }

    componentWillUnmount() {
        delete this.stageItems;
    }

    shouldComponentUpdate(nextProps, nextState) {

        return false;
        if(nextState.stageAction === StageAction.NONE) {
            console.log('RESET')
            return false;
        }
        
        switch(nextState.stageAction) {
            case StageAction.MOVE: {
                console.log(`dont update, ${this.state.stageItem} `)
                return false;
            }
            default:
                break;
        }
        return true;
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(`componentDidUpdate ${prevState.stageItemId} ${this.state.stageItemId}`)
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
        console.log(`StageItem ${id} mouse down ${e.which}`)
        
        if(this.state.stageAction == StageAction.NONE) {
            const stageItem = this.stageItems[id];
            this.setState(
                {
                    stageAction: StageAction.MOVE,
                    stageItem: stageItem,
                    isMouseDown: true,
                    mouseDownPosX: e.clientX,
                    mouseDownPosY: e.clientY,
                    isMove: false,
                }
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
                });
                break;
            }
        }
    }

    handlePosChange = (id, left, top) => {
        this.mgr.updateComponentPos(this.model, id, left, top);
    }


    createTree(modelData){
        return this.process(modelData, 1)
    }


    process(data, currLevel){
        const mgr = this.props.mgr;
        const tree = [];
        if(data.id) {
            const children = this.mgr.findElements(data, (childData) => {
                console.log(`Check stage element for ${data.id}`, this.props.model)
                return mgr.isStageElement(childData)
            });
            
            //console.log(children)
            if(children.length == 0) {
                tree.push(this.treeItem(data));
            } else {
                const nextLevel = currLevel + 1;
                const childItems = [];
                children.forEach( childEl => {  
                    childItems.push(...this.process(childEl, nextLevel))
                });
                const itemWithChildrenContents = this.treeItem(data, childItems);
                tree.push(itemWithChildrenContents);
            }
        }
        return tree;
    }


    treeItem(data, children) {
        const id = data.id;
        const name = data.name;

        const widgetProps = {
            key: id,
            id,
            title: name,
        }
        
        const style = { 
            position: 'absolute', 
            top: data.meta.top,
            left: data.meta.left,
            minWidth: data.meta.minWidth,
        } 

        const StageItem = makeStageItem(
            ElementWidget, 
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
        
        const isContainerItem = children ? true : false;
        const content = isContainerItem ? children : 'Component';
        const itemRef = React.createRef();
        const stageItem = (
            <StageItem 
                ref={itemRef}
                myRef={itemRef}
                id={id}
                key={id}
                style={style}
                isContainer={isContainerItem}
                itemProps={widgetProps}
                notifyEvent={(evt, evtData) => this.handleStageItemNotification(id, evt, evtData)}
            >
                {content}
            </StageItem>
        );
        this.stageItems[id] = {
            ref: stageItem.ref,
            parentRef: null,
        }
        if(isContainerItem) {
            children.forEach(childStItem => {
                const chStageId = childStItem.props.id;
                // console.log(`${chStageId} is child of ${stageItem.props.id}`, this.stageItems[id] )
                this.stageItems[chStageId].parentRef =  stageItem.ref;
            })
        }
        return stageItem;
    }

    
    render() {
        const modelData = this.props.model.data;
        const tree = this.createTree(modelData)
        return (
            <div style={ {position: 'absolute', width:'200%', height:'200%' } }
                ref={this.ref} 
                onMouseMove={(e) => this.handleMouseMove(e, 'STAGE')}
                onMouseUp={(e) => this.handleMouseUp(e, 'STAGE')}
                onDragBegin={(e) => this.handleDragBegin(e, 'STAGE')}
                onDrag={(e) => this.handleDrag(e, 'STAGE')}
                onDragEnd={ (e) => this.handleDragEnd(e, 'STAGE')}
                draggable={true}
            >
                {tree}
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



class ElementWidget extends React.Component {
    render() {
        const props = this.props;
        const wrapClassName = ['widget-container', 'card', props.className]; 
        if(props.selected) {
            wrapClassName.push('selected');
        }
        return (
            <div style={props.style} className={wrapClassName.join(' ')}>
                <div className='widget-header card-header' style={{ padding: '6px' }}>
                    <header>
                        <div className="widget-name">{this.props.title}</div>
                    </header>
                </div>
                <div className='widget-content card-body' style={{position: 'relative'}}>
                    {this.props.content}
                </div>
            </div>
        );
    }
}
