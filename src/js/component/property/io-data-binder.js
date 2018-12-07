import React from 'react';
import { Select } from "./edit-property";

const flowData = {
    id: 'flow2',
    souce: 'form1',
    target: 'query1',
    'par1': {
       id: 'par1',
       name: 'cognome_par',
       source: 'form1.fld2',
       target: 'query1.qi2' 
    },
}

const sourceData = [
    {
        label: 'Cognome',
        id: 'form1.fld1',
    }, 
    {
        label: 'Nome',
        id: 'form1.fld2',
    }
];   

const targetData = [
    {
        label: 'Cognome Query Input',
        id: 'query1.qi1',
        value: 'query1.qi1'
    }, 
    {
        label: 'Nome Query Input',
        id: 'query1.qi2',
        value: 'query1.qi2',
    }
];

export function getIODataBinderTestData() {
    return {
        parameters: flowData,
        sourceData,
        targetData
    }
}

export class IODataBinder extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            flowData: this.props.flowData,
            parameters: this.props.parameters,
            sourceData: this.props.sourceData,
            targetData: this.props.targetData,
        }
    }
    
    handleSourceSelect = (dataKey, newValue) => {
        console.log(`Target${dataKey}: ${newValue}`)
    }


    getSelectionInput(targertId, dataKey, currValue) {
        const inputProps = {
            id: targertId,
            name: targertId,
            value: currValue,
            className: 'form-control',
            itemData: this.state.sourceData, 
            disabled: '',
            onUpdate: this.handleSourceSelect
        }
        return <Select key={dataKey} {...inputProps} noSelection={true}/>
    }
    
    render() {
        const sourceToTarget = this.state.targetData.map(trgData => {
            const id = trgData.id;
            const dataKey = id;
            const param = this.state.parameters[id];
            const currValue = param ? param.source : null;
            const srcSelect = this.getSelectionInput(id, dataKey, currValue)
            const targetLabel = trgData.label;
            return (
                <tr key={id}>
                    <td>{srcSelect}</td>
                    <td>{targetLabel}</td>
                </tr>
            )
        });

        return (
            <table className="table table-bordered table-hover table-sm">
                <thead>
                    <tr>
                        <th>Source({this.props.source.name})</th>
                        <th>Target({this.props.target.name})</th>  
                    </tr>
                </thead>
                <tbody>
                    {sourceToTarget}
                </tbody>
            </table>
        );
    }
}