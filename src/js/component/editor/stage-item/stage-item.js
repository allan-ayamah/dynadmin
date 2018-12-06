import React from 'react';
import ReactDOM from 'react-dom';
import { clone } from '../../../common/helpers'


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
                children: this.props.children ? this.props.children : [],
                data: this.props.data,
                event: StageItemEvent.NONE,
                eventData: null,
                selected: this.props.selected,
                initialStyle: this.initialStyle,
                name: this.props.itemProps.name,
                top: this.initialStyle.top,
                left: this.initialStyle.left,
                minWidth: this.initialStyle.minWidth, 
                minHeight: this.initialStyle.minHeight,
            }
        }


        init(data) {
            
        }

        /**
         * Adds new children
         * @param {Array[StageItem]} children 
         */
        addChildren(children) {
            const newChildren = this.state.children;
            if(Array.isArray(children)) {
                newChildren.push(...children)
            } else {
                newChildren.push(children)
            }

            this.setState({
                children: newChildren
            })
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
                    this.setState({ 
                        event: StageItemEvent.NONE,
                        top: data.top,
                        left: data.left,
                        minHeight: data.minHeight,
                        minWidth: data.minWidth
                    }, callback());
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


        resize = (childId) => {
            const children = this.state.children
            if(!children.length) return;
            return;
            
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
            alert(`StageItem[${this.props.id}] is mounted`)
            this.resize();
        }

        componentWillUnmount() {
            alert(`StageItem[${this.props.id}] un mounting`)
            //this.props.notifyEvent
        }

        shouldComponentUpdate(nextProps, nextState) {
            return true;
        }


       componentDidUpdate(prevProps, prevState) {
           const notifyData = clone(this.state);
           switch(this.state.event) {
               case StageItemEvent.RESIZE: {
                   this.setState({
                        event: StageItemEvent.NONE,
                        eventData: null,
                   },
                   () => {
                       this.props.notifyEvent(StageItemEvent.RESIZE, notifyData, prevState)
                    })
                    break;
               }
               case StageItemEvent.UPDATE_POSITION: {
                    this.setState({
                        event: StageItemEvent.NONE,
                        eventData: null,
                    },
                    () => {
                        this.props.notifyEvent(StageItemEvent.UPDATE_POSITION, notifyData, prevState)
                    })
                break;
               }
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
        

        render() {
            const itemProps  =  this.props.itemProps;
            itemProps.name = this.state.data.name;
            itemProps.data = this.state.data;
            itemProps.children =  this.state.children;
            itemProps.event = this.state.event;

            let itemStyle = {}
            if(this.state.children.length) {
                itemStyle = {
                    minWidth: this.state.minWidth, 
                    minHeight: this.state.minHeight
                }
            }
            
            const style = Object.assign(clone(this.initialStyle), { 
                top: this.state.top, 
                left: this.state.left 
            });

            
            console.log(`${this.props.id} RENDER`, this.state)
            
            return (
                <div ref={this.myRef}
                    style={style}
                    {...eventListeners}
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
