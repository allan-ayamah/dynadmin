import React from 'react';
import { clone } from '../../common/helpers'

export function makeStageItem(Item, initialStyle) {
    class StageItem extends React.Component {
        constructor(props) {
            super(props)
            this.ref = React.createRef();
            this.initialStyle = clone(initialStyle);
            this.state = {
                initialStyle: this.initialStyle,
                top: this.initialStyle.top,
                left: this.initialStyle.left,
                selected: false
            }
        }

        componentDidMount() {
            console.log(`Stage item ${this.props.id} did mount`)
        }

        componentDidUpdate(prevProps, prevState) {
            const { top, left } = this.state;
            this.props.handlePosChange(left, top);
        }

        getTop = () => {
            return this.state.top;
        }
        
        getLeft = () => {
            return this.state.left;
        }

        setSelected(selected) {
            this.setState({selected})         
        }

        getSelected = () => {
            return this.state.selected;
        }

        render() {
            const itemProps  =  this.props.itemProps;
            const style = Object.assign(clone(this.initialStyle), { 
                top: this.state.top, 
                left: this.state.left 
            });
            return (
                <div style={style}
                    onMouseDown={this.props.handleMouseDown}
                    onMouseMove={this.props.handleMouseMove}
                    onMouseUp={this.props.handleMouseUp}
                >
                    <Item 
                        ref={this.ref}
                        selected={this.state.selected}
                        {...itemProps} 
                    />              
                </div>
            )
        }
    }
    return StageItem;
}

