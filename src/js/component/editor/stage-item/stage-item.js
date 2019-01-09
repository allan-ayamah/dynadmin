import React from 'react';
import ReactDOM from 'react-dom';
import { clone } from '../../../common/helpers'
import { StageItemType } from '.';


export const StageItemEvent = {
    NONE: 'RESTORE',
    READY: 'READY',
    FOCUS: 'FOCUS',
    DRAG_BEGIN: 'DRAG_BEGIN',
    DRAG: 'DRAG',
    DRAG_END: 'DRAG_END',
    MOVED: 'MVD',
    CHILD_MOVED: 'CH_MVD',
    RESIZE : 'RESIZE',
    UPDATE_POSITION: 'U_COORD',
    UN_MOUNTING: 'UM',
    RENDER_CHILDREN: "RC",
    DONT_UPDATE: "D_UP",
    UPDATE_DATA: "UD"
}

const CONTAINER_HEADER_HEIGHT = 37;

const CONTAINER_OFFSET_Y = 20;
const CONTAINER_OFFSET_X = 20;

const CONTAINER_PADDING = {
    TOP: 10,
    LEFT: 10,
    RIGHT: 10,
    BOTTOM: 10,
}

export function makeStageItem(Item, eventListeners) {
    class StageItem extends React.Component {
        constructor(props) {
            super(props)
            this.myRef = React.createRef();
            this.initialStyle = this.props.style;
            this.state = {
                initialised: false,
                children: this.props.children,
                data: this.props.data,
                event: StageItemEvent.NONE,
                eventData: null,
                selected: this.props.selected,
                initialStyle: this.initialStyle,
                top: this.initialStyle.top,
                left: this.initialStyle.left,
                minWidth: this.initialStyle.minWidth, 
                minHeight: this.initialStyle.minHeight,
            }
        }



        updatePosition(newPosition) {
            console.log(`${this.getStageId()}, update POS`, newPosition)
            this.setState({ 
                event: StageItemEvent.UPDATE_POSITION,
                top: newPosition.top,
                left: newPosition.left,
                minHeight: newPosition.minHeight,
                minWidth: newPosition.minWidth
            })
        }

        addChildren(children) {
            if(!this.props.isContainer) return;
            console.log(`${this.getStageId()}Add new child`)
            const newChildren =  this.state.children.concat(children);
            this.setState({
                event: StageItemEvent.RENDER_CHILDREN,
                children: newChildren,
            })
        }

        delete() {
            this.setState({
                event: StageItemEvent.UN_MOUNTING,
            })
        }

        deleteChildren(stageIds) {
            if(!this.props.isContainer) return;
            console.log(`${this.getStageId()}unmount new child`)
            
            if(this.state.children.length == 0)
                return;
            const newChildren = [];
            this.state.children.forEach((ch) => {
                if(stageIds.includes(ch.ref.current.getStageId())){
                    ch.ref.current.delete();
                } else {
                    newChildren.push(ch)
                }
            })  
            if(this.state.children.length === newChildren.length) {
                this.setState({
                    children: newChildren
                })
            }
        }

        getChildrenStageIds() {
            if(this.props.isContainer &&
                this.state.children.length) {
                return this.state.children.map( child => {
                    return child.ref.current.getStageId();
                })
            }
            return []
        }

        

        updateData(newData) {
            this.setState({
                event: StageItemEvent.UPDATE_DATA,
                data: newData,
            })
        }

        handleClick = (e) => {
            e.stopPropagation()
            this.props.onClick();
        }
        
        handleEvent = (stageItemEvent, data, callback = () => {}) => {
            const e  = data.evt;
            console.log(`On event: ${stageItemEvent}`)
            switch(stageItemEvent) {
                case StageItemEvent.FOCUS: {
                    console.log(`${this.props.id} FOCUS ${e.clientX} ${e.clientY}`)
                    this.setState({
                        event: stageItemEvent,
                        selected: true,
                    }, callback())
                    break;
                }    
                case StageItemEvent.UPDATE_POSITION: {
                    break
                }
                default:
                break;
            }
        }

        nextCoordinates = (mouseDeltaX, mouseDeltaY) => {
            console.log(`${this.props.id} NextCood , ${mouseDeltaX} ${mouseDeltaY}`)
            let topBefore = this.state.top;
            let leftBefore = this.state.left;

            console.log(`${this.props.id} previouse cooord, ${leftBefore} ${topBefore}`)

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

            console.log(`${this.props.id} NEW COORD, ${newTop} ${newLeft}`)
            return {
                top: newTop,
                left: newLeft,
            }
        }


        reviewWidthAndHeight() {
            const rect = this.getRect();
            const newState = {
                event: StageItemEvent.UPDATE_POSITION
            }
            if(rect.width > this.state.minWidth) {
                newState.minWidth = rect.width;
            } 
            if(rect.height > this.state.minHeight) {
                newState.minHeight = rect.height;
            }
            if(newState.minWidth || newState.minHeight) {
                this.setState(newState);
            }
        }

        resize = (childId) => {

            if(!this.props.isContainer) {
                return this.reviewWidthAndHeight();
            }
            const children = this.state.children
            
            // find child wiht max top
            // console.log(this.props.children)
           
            const first = children[0].ref.current;
            let topMostChild, rightMostChild, bottomMostChild, leftMostChild;
            topMostChild = rightMostChild = bottomMostChild = leftMostChild = first;

            
        
            children.forEach(child => {
                const currRef = child.ref.current;
                if(currRef) {
                    // Top most
                    if(currRef.getTop() < topMostChild.getTop()){
                        topMostChild = currRef;
                    }
                    // Rightmost
                    if(currRef.getLeft() > rightMostChild.getLeft()) {
                        rightMostChild = currRef;
                    }
                    // bottommost
                    if(currRef.getTop() > bottomMostChild.getTop()) {
                        bottomMostChild = currRef;
                    }
                    // Leftmost
                    if(currRef.getLeft() < leftMostChild.getLeft()) {
                        leftMostChild = currRef;
                    }
                }
            });

            const myRect = this.getRect();

            const newState = {
                top: this.getTop(),
                left: this.getLeft(),
                minHeight: Math.max(this.state.minHeight || 0, 0),
                minWidth:  Math.max(this.state.minWidth || 0, 0),
             };
                       
            const topMostY = topMostChild.getTop();
            if(topMostY < 0) {
                const myNewTop = topMostY;
                newState.top = myNewTop;
            } 

            const leftMostX = leftMostChild.getLeft();
            if(leftMostX < 0) {
                newState.left-= -1*(leftMostX)
                //alert(`${this.props.id} Move left: ${leftMostX}, newLeft: ${ newState.left}`)
            } else if(leftMostX > 0) {
                newState.left+= leftMostX;
                if(newState.minWidth >= 0){
                    //newState.minWidth-= leftMostX
                } 
            }


            const bottomMostRect = bottomMostChild.getRect();
            const expectedH = (bottomMostChild.getTop() + bottomMostRect.height) + (CONTAINER_HEADER_HEIGHT + CONTAINER_OFFSET_Y);
            const actualH = newState.minHeight;     
            if(actualH !== (expectedH)) {
                newState.minHeight = expectedH;
            }

            const rightMostRect = rightMostChild.getRect();
            const expectedW = (rightMostChild.getLeft() + rightMostRect.width) + CONTAINER_OFFSET_X;
            const actualW = newState.minWidth;
            if(actualW !== expectedW) {
                newState.minWidth = expectedW;
            }

            newState.event = StageItemEvent.RESIZE;
            this.setState(newState);
        }

        componentDidMount() {
            console.log(`StageItem[${this.props.id}] is mounted`)
            this.props.notifyEvent(StageItemEvent.READY, this.state)
        }

        componentWillUnmount() {
            alert(`StageItem[${this.props.id}] un mounting`)
            this.props.notifyEvent(StageItemEvent.UN_MOUNTING, this.state)
        }

        shouldComponentUpdate(nextProps, nextState) {
            if((nextState.event === StageItemEvent.UPDATE_POSITION
                || nextState.event === StageItemEvent.RENDER_CHILDREN
                || nextState.event === StageItemEvent.UPDATE_DATA
                || nextState.event === StageItemEvent.UN_MOUNTING
                )) {
                console.log(`StageItem[${this.props.id}] should update`)
                return true;
            }
            console.log(`StageItem[${this.props.id}] WILL NOT update ${this.state.event} - ${nextState.event}`)
            return false;
        }


       componentDidUpdate(prevProps, prevState) {
           console.log(`${this.getStageId()} did update`)
           if(this.state.event === StageItemEvent.NONE) return;
           const eventToSend = clone(this.state.event);
           this.setState({
               event: StageItemEvent.NONE, 
               eventData: null
            }, () => this.props.notifyEvent(eventToSend, this.state, prevState));

            //Check actual width and height
            if(!this.state.event === StageItemEvent.UN_MOUNTING) {
                this.reviewWidthAndHeight();
            }
        }

        getTop = () => {
            return this.state.top;
        }
        
        getLeft = () => {
            return this.state.left;
        }

        getMinHeight = () => {
            return this.state.minHeight;
        }

        getMinWidth = () => {
            return this.state.minWidth;
        }

        getDOMNode = () => {
            return this.myRef.current;
        }

        getRect(){
            return this.myRef.current.getBoundingClientRect();
        }

        setSelected(selected) {
            this.setState({selected})         
        }

        getSelected = () => {
            return this.state.selected;
        }

        getLevel = () => { return this.props.level }


        getStageId = () => { return this.props.stageId } 

        isContainerType() {
            return this.props.isContainer;
        }
        

        render() {

            if(this.state.event === StageItemEvent.UN_MOUNTING) {
                return <></>
            }
          
            const itemProps  =  this.props.itemProps;
            itemProps.name = this.state.data.name;
            itemProps.data = this.state.data;
            itemProps.children =  this.state.children;
            itemProps.event = this.state.event;

            let itemStyle = {}
            
            let zIndex = this.getLevel() * 100;
            itemStyle = {
                minWidth: this.state.minWidth, 
                minHeight: this.state.minHeight,
                //zIndex
            }
            
            
            const style = Object.assign(clone(this.initialStyle), { 
                position: 'absolute',
                top: this.state.top, 
                left: this.state.left,
                //zIndex
            });

            
            console.log(`${this.props.id} CALL FOR RENDER`, this.state)
            
            return (
                <div id={this.props.stageId} 
                    onClick={this.handleClick} style={style} ref={this.myRef}
                >
                 <Item style={itemStyle} 
                        selected={this.state.selected}
                        {...itemProps} 
                   />
                </div>
            )
        }
    }
    return StageItem;
}
