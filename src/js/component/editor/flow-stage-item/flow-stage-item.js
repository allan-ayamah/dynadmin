import React from 'react';
import SVGArrow from './svg-arrow';

const FLOW_STATUS = {
    WAIT: 0,
    CONNECTED: 1,
}

const FLOW_TYPE__STYLE = {
    flow: {
        strokeColor: '#456',
        strokeWidth: 2,
    }
}
export default class FlowStageItem extends React.Component {
    constructor(props) {
        super(props)
        const flowStyle = FLOW_TYPE__STYLE.flow;
        this.state = {
            status: FLOW_STATUS.WAIT,
            data: this.props.data,
            ...flowStyle
        }
    }
    

    connect = (srcRect, trgRect) => {
        const startingPoint = {
            x: srcRect.x,
            y: srcRect.y
        }
        
        const endingPoint = {
            x: trgRect.x,
            y: trgRect.y,
        }

        const arrowLength = 100;
        const startingAnchor = 'right';
        const endingAnchor= 'left';

        this.setState({
            status: FLOW_STATUS.CONNECTED,
            startingPoint,
            startingAnchor,
            endingPoint,
            endingAnchor,
            arrowLength
        })
    }

    getArrow = (srcRect, trgRect) => {
        if(this.state.status === FLOW_STATUS.WAIT) {
            return null;
        }
        alert(`${this.props.id} got arrows`)
        return <SVGArrow key={this.props.id} {...this.state}/>
    }

    render() {
        const svgStyle = {
            position: 'absolute',
        }

        const svgClassName =  this.props.className;
        return (
            <>
                {this.getArrow()}
            </>
        );
    }

    /*
    render() {
        const props = this.props;
        let svgClassName = `card ${props.className} flowComponent`; 
        if(props.selected) {
            svgClassName+=`--selected`
        }

        const svgStyle = {
            position: 'absolute',
            top: 0.0,
            left: 50,
        }
        return (
            <svg style={svgStyle}
                width={190} 
                height={100}
                pointer-events="none"  
                version="1.1" xmlns="http://www.w3.org/2000/svg"
                className={svgClassName}
            >
                <path 
                    d="M 0 0 L 190 100 " 
                    transform="translate(0.5,0.5)" 
                    pointer-events="visibleStroke" 
                    version="1.1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    stroke="#456" 
                    style={null}
                ></path>
                <path 
                    pointer-events="all" 
                    version="1.1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    d="M112,75 L106.47298351029684,65.28135355501861 L104.52183540722042,69.99230049590653 L100.908872950193,73.5904253247737 L112,75" 
                    stroke="#456" 
                    fill="#456" 
                    transform="translate(0.5,0.5)"></path>
            </svg>
        );
    }*/
}