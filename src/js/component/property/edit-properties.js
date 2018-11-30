import React from 'react';
import { OBJECT_TYPE__INPUT_TYPE, Input, TextArea, Select } from './edit-property';



function getInputType(type, inputProps) {
    if(Array.isArray(inputProps.itemData) || (typeof inputProps.itemData === 'object')) {
        return <Select {...inputProps}/>
    }    
    if(type === 'text') {
        return <TextArea {...inputProps}/>
    } 
    let inputType = OBJECT_TYPE__INPUT_TYPE[type];
    if(inputType === undefined) {
        inputType = typeof inputProps.value;
    }
    return <Input type={inputType} {...inputProps}/>   
}



export class EditProperties extends React.Component {
    constructor(props) {
        super(props);
        this.attributes = Object.keys(props.attrConfig);
        this.state = { data: props.data };
    }


    onPropertyUpdate = (dataKey, value) => {
        this.props.handleSaveProperty(dataKey, value);
        const dataId = this.state.data.id;
        const data = this.props.model.get(dataId)
        this.setState({ data: data });
    }

    propertyData = (propertyName) => {
        console.log(`Get Data for ${propertyName}`)
        const config = this.props.attrConfig[propertyName]
        const data = config.data;

        // Static data source
        if(data !== undefined) {
            if(typeof data === 'function'){
                console.log(`${propertyName} data is function `)
                const _id = this.state.data.id;
                return data(
                    this.state.data,
                    this.props.model.parent(_id), 
                    this.props.model.data,
                    this.props.mgr
                );
            }
            return data;
        } 

        // Get data from localContext or parent component
        if(config.dataExpr) {
            if(config.dataExpr.startsWith('@')) {
                // self reference
                console.log(`Self reference: ${config.dataExpr}`)
                const originalExpr = config.dataExpr.replace('@', '');
                const exprParts = originalExpr.split('.');
                const refProperty = exprParts[0].substring(0, exprParts[0].length);
                // @referencedData contains the datakey to the actual data we want
                const refDataKey = this.state.data[refProperty];
                console.log(
                    `ReferencedProperty: ${refProperty}, Referenced dataKey: ${refDataKey}`
                )
                if(this.props.model.has(refDataKey)){
                    const isRefDataOutput = originalExpr.endsWith("output");
                    console.log("PASSS")
                    if(isRefDataOutput || originalExpr.endsWith("input")) {
                        const dataIO = this.props.mgr.getElementIO(this.props.model, refDataKey);
                        return isRefDataOutput ? dataIO.output : dataIO.input
                    }

                    // construct dataKey for the desired data
                    const dataKey = originalExpr.split(refProperty).join(refDataKey);
                    const data = this.props.model.get(dataKey);
                    return data || [];
                } 
                return [];
            }
        }
        return '';
    }

    render() {
        const attrsElements = this.attributes.map((id) => {
            const attrConfig = this.props.attrConfig[id];
            const attrData = this.propertyData(id);
            let isEnabled = true;
            if(typeof attrConfig.isEnabled === 'boolean') {
                isEnabled = attrConfig.isEnabled;
            } else if(typeof attrConfig.isEnabled == 'function') {
                isEnabled = attrConfig.isEnabled(this.state.data);
            }
            const dataKey = this.props.dataKeys[id];
            const currValue = this.state.data[id];
            const inputProps = {
                id: dataKey,
                key: dataKey, 
                name: dataKey,
                value: currValue,
                className: 'form-control',
                itemData: attrData, 
                disabled: (!isEnabled) ? 'disabled' : '',
                onUpdate: this.onPropertyUpdate
            }

            const input =  getInputType(attrConfig.type, inputProps)
            const inputLabel = attrConfig.name;
            return (
                <div key={`ROW_${id}`}className="attr-item form-group row">
                    <label className="attr-label col-sm-4 col-form-label">{inputLabel}</label>
                    <div className="attr-input col-sm-8">{input}</div>
                </div>
            );
        });
        return (
            <>{attrsElements}</>
        )
    }
}


export default EditProperties;