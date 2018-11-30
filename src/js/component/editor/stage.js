
import React from 'react';
import ReactDOM from 'react-dom';
import { makeStageItem } from './stage-item';


const StageAction = {
    MOVE: 'move',
    NONE: '',
}

const STAGE_ITEM_ID_PREFIX = 'dyn_stage_i_';
const STAGE_CANVAS_REF_NAME = 'stage_canvas';

export class Stage extends React.Component {
    constructor(props) {
        super(props);
        this.mgr = props.mgr;
        this.model = this.props.model;

        this.ref = React.createRef(STAGE_CANVAS_REF_NAME);
        this.elementsRef = {};
        this.state = {
            stageAction: StageAction.NONE,
            focusedElementId: null,
            isMouseDown: false,
            isMove: false,
            mouseDownPosX: 0,
            mouseDownPosY: 0,
            moveDeltaX: 0,
            moveDeltaY: 0,
        }
    }

    componentDidMount() {
        console.log(`${this.ref.current.id} Stage mounted`, this.ref.current)
        console.log(this.elementsRef)
    }

    componentWillUnmount() {
        delete this.elementsRef;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextState.stageAction !== StageAction.NONE) {
            switch(nextState.stageAction) {
                case StageAction.MOVE: {
                    if(nextState.focusedElementId
                        && ((nextState.focusedElementId === this.state.focusedElementId))
                        ) {
                            console.log(`dont update, ${this.state.focusedElementId} is beign dragged`)
                            return false;
                    }
                    break;
                }
            }
        }
        return true;
    }

    componentDidUpdate(prevProps, prevState) {
        console.log(`componentDidUpdate ${prevState.focusedElementId} ${this.state.focusedElementId}`)
    }

    handleMouseDown = (e, srcElementId) => {
        e.stopPropagation();
        console.log(`StageItem ${srcElementId} mouse down`)
        const x = e.clientX;
        const y = e.clientY;
        this.setState({
            stageAction: StageAction.MOVE,
            focusedElementId: srcElementId,
            isMouseDown: true,
            isMove: false,
            mouseDownPosX: x,
            mouseDownPosY: y,
            moveDeltaX: 0,
            moveDeltaY: 0,
        }, () => this.props.handleElementClick(this.state.focusedElementId));
    }

    handleMouseMove = (e, targetId) => {
        e.stopPropagation();
        const currentId = this.state.focusedElementId
        
        if(this.state.isMouseDown && currentId) {
            console.log(`Stage ${targetId} - ${currentId} mouse move ${e.clientX - this.state.mouseDownPosX}`)
            this.setState({
                isMove: true,
                moveDeltaX: e.clientX - this.state.mouseDownPosX,
                moveDeltaY: e.clientY - this.state.mouseDownPosY
            });
        }
        
    }

    handleMouseUp = (e, targetId) => {
        e.stopPropagation();
        const currentAction = this.state.stageAction;
        if(currentAction !== StageAction.NONE) {
            const id = this.state.focusedElementId;
            const stageItemRef = this.elementsRef[id].current;
            switch(currentAction) {
                case StageAction.MOVE: {
                    if(!this.state.isMouseDown) {
                        this.cleanup(StageAction.MOVE)
                    } else {
                        console.log(`Stage ${targetId} mouse up`)
                        if(this.state.moveDeltaX 
                            && this.state.moveDeltaY) {
                            const left = stageItemRef.getLeft() + this.state.moveDeltaX;
                            const top = stageItemRef.getTop() + + this.state.moveDeltaY;
                            stageItemRef.setState(
                                { 
                                    top: top, 
                                    left: left
                                },
                                () => this.cleanup(StageAction.MOVE) 
                            );
                        } else {
                            this.cleanup(StageAction.MOVE)
                        }
                    }
                    break;
                }
            }
        }
    }


    cleanup(action) {
        switch(action) {
            case StageAction.MOVE:{
                this.setState({
                    focusedElementId: null,
                    isMouseDown: false,
                    isMove: false,
                    mouseDownPosX: 0,
                    mouseDownPosY: 0,
                    moveDeltaX: 0,
                    moveDeltaY: 0,
                });
                break;
            }
        }
    }




    handlePosChange = (id, left, top) => {
        this.mgr.updateComponentPos(this.model, id, left, top);
    }

    resizeParentOf = (childId) => {
        const childComponent = this.model.get(childId);
        const { top, left, width, height } = childComponent.meta;
        const parent = this.model.parent(childId);
        const parentMeta = parent.meta;

        let  parentWidth = parentMeta.width;
        if(left > parentMeta.left) {
            parentWidth = left + width;
        }
        const ancestor = this.model.parent(parent.id);
        if(ancestor.id && ancestor.id != parent.id){
            this.resizeParentOf(parent.id);
        }
    }


    createTree(modelData){
        return this.process(modelData, 1)
    }


    process(data, currLevel){
        const mgr = this.props.mgr;
        const tree = [];
        if(data.id) {
            const children = this.mgr.findElements(data, (childData) => {
                return mgr.isStageElement(childData)
            });

            //console.log(children)
            if(children.length == 0) {
                const singleItem = this.treeItem(data);
                tree.push(singleItem);
            } else {
                const nextLevel = currLevel + 1;
                const childItems = [];
                children.forEach( childEl => {
                    childItems.push(this.process(childEl, nextLevel))
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
        
        const isContainerComponent = children ? true : false;
        const widgetContent = isContainerComponent ? children : 'Empty'
        const widgetProps = {
            key: id,
            id,
            title: name,
            content: widgetContent,
        }
        
        const style = { 
            position: 'absolute', 
            top: data.meta.top,
            left: data.meta.left,
            minWidth: data.meta.minWidth,
        } 
        const StageItem = makeStageItem(ElementWidget, style);
        this.elementsRef[id] = React.createRef(`${STAGE_ITEM_ID_PREFIX}${id}`);
       
        const stageItem = (
            <StageItem 
                ref={this.elementsRef[id]}
                id={id}
                itemProps={widgetProps}
                handlePosChange={(left, top) => this.handlePosChange(id, left, top)}
                handleMouseDown={(e) => this.handleMouseDown(e, id)}
                handleMouseMove={(e) => this.handleMouseMove(e, id)}
                handleMouseUp={(e) => this.handleMouseUp(e, id)}
            />
        );
        return stageItem;
    }

    
    render() {
        const modelData = this.props.data;
        const tree = this.createTree(modelData)
        return (
            <div style={ {position: 'absolute', width:'200%', height:'200%' } }
                ref={this.ref} 
                onMouseMove={(e) => this.handleMouseMove(e, 'STAGE')}
                onMouseUp={ (e) => this.handleMouseUp(e, 'STAGE')}>
                {tree}
            </div>
        );
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
            <div className={wrapClassName.join(' ')}>
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
