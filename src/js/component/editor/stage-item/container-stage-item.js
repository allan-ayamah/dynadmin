import React from 'react';

export default class ContainerStageItem extends React.Component {
    render() {
        const props = this.props;
        let wrapClassName = `card ${props.className} widget-container `; 
        if(props.selected) {
            wrapClassName+=`--selected`
        }
        return (
            <div style={props.style} className={wrapClassName}>
                <div className='widget-header card-header' style={{ padding: '6px' }}>
                    <header>
                        <div className="widget-name">{this.props.name}</div>
                    </header>
                </div>
                <div className='widget-content card-body' style={{position: 'relative'}}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}
