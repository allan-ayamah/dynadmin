import React from 'react';
import EditProperty from './edit-property';
import helpers from '../../common/helpers';

export class EditProperties extends React.Component {
    constructor(props) {
        super(props);
        this.data = props.data;
        this.attributes = Object.keys(props.attrConfig);
        this.state = {};
        //Assign current values
        /*this.attributes.forEach(name => {
            const propertyVal = this.data[name];
            return this.state[name] = propertyVal;
        });*/
    }


    propertyData = (propertyName) => {
        const config = this.props.attrConfig[propertyName]
        const data = config.data;

        // Static data source
        if(data !== undefined) {
            if(typeof data === 'function'){
                const _id = this.data.id;
                return data(
                    this.props.mgr,
                    this.data,
                    this.props.model.parent(_id), 
                    this.props.model.data
                );
            }    
            if(data.labelValue) {
                return data.labelValue.map( val => {
                    return {label: val, value: val}
                });
            }
            if(data.label && data.value) {
                return data.value.map( (val, idx) => {
                    return {label: data.label[idx], value: val}
                });
            }
            const dtSource = (data.value || data.label);
            if(dtSource) {
                return dtSource.map( val => {
                    return {label: val, value: val}
                });
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
                const referencedProperty = exprParts[0].substring(0, exprParts[0].length);
                console.log(
                    `ReferencedProperty[${referencedProperty}]: 
                    ${this.data[referencedProperty]}`
                )
                if(this.data[referencedProperty]){
                    // @referencedData contains the datakey to the actual data we want
                    const referencedData = this.data[referencedProperty];
                    // contrcut data key
                    const dataKey = originalExpr.split(referencedProperty).join(referencedData);
                    const data = this.props.model.get(dataKey);
                    return data;
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
            const dataKey = this.props.dataKeys[id];
            let isEnabled = true;
            if(typeof attrConfig.isEnabled === 'boolean') {
                isEnabled = attrConfig.isEnabled;
            } else if(typeof attrConfig.isEnabled == 'function') {
                isEnabled = attrConfig.isEnabled(this.data);
            }

            return (
                <EditProperty 
                    key={dataKey} id={dataKey} 
                    value={this.data[id]} 
                    label={attrConfig.name} 
                    className='form-control'
                    data={attrData} 
                    disabled={!isEnabled}
                    onUpdate={this.props.handleSaveProperty}>
                </EditProperty>
         //       
            );
        });
        return (
            <>{attrsElements}</>
        )
    }
}

export default EditProperties;