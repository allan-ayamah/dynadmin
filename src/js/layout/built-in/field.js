import React, { useState } from 'react';

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
        />
    )
}

export function Select(props) {
    const [selected, setSelected] = useState(props.selected);

    const handleChange = (value) => {
        setSelected(value);
    }

    const values = props.values || [];
    const labels = props.labels || [];
    let options=[]
    if(values.length > 0) {
        values.forEach( (val, idx) => {
            options.push(
                <option key={val} value={val}>
                    {labels[idx]}
                </option>
            )            
        });
    }
    return (
        <select 
            id={props.id}
            name={props.id}
            value={selected}
            disabled={props.disabled} 
            onChange={(evt) => handleChange(evt.target.value)} 
            className={props.className}
        >
            {options}
        </select>
    );
}
