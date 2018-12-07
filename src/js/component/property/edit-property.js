import React, { useState } from 'react';


export const OBJECT_TYPE__INPUT_TYPE = {
    string: 'text',
    text: 'textarea',
    boolean: 'checkbox',
    number: 'number',
}

export function TextArea(props) {
    const [value, setValue] = useState(props.value);
    return (
        <textarea 
        id={props.id}
        name={props.id}
        className={props.className}
        value={value}
        disabled={props.disabled} 
        onChange={(evt) => setValue(evt.target.value)}
        onBlur={(evt) => props.onUpdate(props.id, evt.target.value)}
        />
    )
}

export function Input(props){
    const [value, setValue] = useState(props.value);
    const type = props.type;
    if(props.type === 'checkbox'){
        return (
            <input 
                id={props.id}
                name={props.id}
                type='checkbox'
                checked={value}
                disabled={props.disabled} 
                onChange={(evt) => setValue(evt.target.checked)}
                onBlur={(evt) => props.onUpdate(props.id, evt.target.checked)}
            />
        )
    }
    return (
        <input 
            type={type}
            id={props.id}
            name={props.id}
            className={props.className}
            value={value}
            disabled={props.disabled} 
            onChange={(evt) => setValue(evt.target.value)}
            onBlur={(evt) => props.onUpdate(props.id, evt.target.value)} 
        />
    )

}


const normalizeOptionsArray =  function(data, noSelection = false) {
    if(!data) return [];
    if(Array.isArray(data)) {
        return noSelection ? [{ label: '', value: '' }, ...data] : data;
    }
    // Object
    const resultArray = (noSelection || data.noSelection) ? [{ label: '', value: '' }] :  [];
    if(data.labelValue !== undefined) {
        data.labelValue.forEach( val => {
            resultArray.push({ label: val, value: val });
        });
        return resultArray;
    }
    const valueIsDefined = data.value !== undefined;
    const labelIsDefined = data.label !== undefined
    if(valueIsDefined && labelIsDefined) {
        data.value.forEach( (val, idx) => {
            resultArray.push({ label: data.label[idx], value: val})
        });
        return resultArray;
    } 
    const dtSource = data.value || data.label;
    dtSource.forEach( val => {
        resultArray.push({ label: val, value: val });
    });
    return resultArray;
}



export function Select(props) {
    const [value, setValue] = useState(props.value);

    const handleChange = (value) => {
        props.onUpdate(props.id, value)
        setValue(value);
    }

    const normalizedData = normalizeOptionsArray(props.itemData, props.noSelection);
    let options=[]
    if(normalizedData.length > 0) {
        normalizedData.forEach(opt => {
            const label = opt.label !== undefined ? opt.label : opt;
            const value = opt.value !== undefined ? opt.value : opt.id ? opt.id : opt;
            options.push(
                <option key={value} value={value}>
                    {label}
                </option>
            );
        });
    }
    return (
        <select 
            id={props.id}
            name={props.id}
            value={value}
            disabled={props.disabled} 
            onChange={(evt) => handleChange(evt.target.value)} 
            className={props.className}
        >
            {options}
        </select>
    );
}