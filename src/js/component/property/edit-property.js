import React,{useState} from 'react';

function Input(props){
    const [value, setValue] = useState(props.value);
    const type = props.type;
   
    if(props.type == 'checkbox'){
        return (
            <input 
                id={props.id}
                name={props.id}
                type='checkbox'
                checked={value}
                className={props.className}
                disabled={props.disabled} 
                onChange={(evt) => props.onUpdate(props.id, evt.target.checked)}
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
            onChange={(evt) => setValue(evt.target.value)}
            disabled={props.disabled} 
            onBlur={(evt) => props.onUpdate(props.id, evt.target.value)} 
        />
    )

}



function Select(props) {
    let options=[]
    if(props.itemData.length > 0) {
        options = [<option key={''} value={''}></option>];
        props.itemData.forEach(opt => {
            const label = opt.label !== undefined ? opt.label : opt;
            const value = opt.value !== undefined ? opt.value : opt;
            //console.log(`${value}: ${label}`)
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
            disabled={props.disabled} 
            onChange={(evt) => props.onUpdate(props.id, evt.target.value)} 
            className={props.className}
        >
            {options}
        </select>
    );
}

const ITEM_INPUT_TYPE = {
    string: 'text',
    boolean:'checkbox',
    number: 'number',
    object: 'text'
}

export default function EditProperty(props) {
    const {id, value, label} = props;

    let contentProps = {
        id: props.id, 
        name: props.id,
        value: props.value,
        className: props.className,
        itemData: props.data, 
        disabled: props.disabled ? 'disabled' : '',
        onUpdate: props.onUpdate
    }
    let content = null;
    const isArrayItemData = Array.isArray(props.data);
    if(isArrayItemData){
        content = <Select {...contentProps}/>
    } else {
        const valType = typeof props.value;
        const inputType = ITEM_INPUT_TYPE[valType];
        content = <Input type={inputType} {...contentProps}/>
    }

    return(
        <div className="attr-item form-group row">
            <label className="attr-label col-sm-2 col-form-label">{label}</label>
            <div className="attr-input col-sm-10">{content}</div>
        </div>
    )
}