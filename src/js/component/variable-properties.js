import React, {useState, useEffect, useRef} from 'react';


const VARIABLE_DATA_TYPES = {
    component: {
    	value: 'component', 
    	label: 'component'
    },
    string: {
    	value: 'string', 
    	label: 'string'
    },
    int: {
    	value: 'int', 
    	label: 'int'
    },
    float: {
    	value: 'float', 
    	label: 'float'
    }
}



function getDataTypesOptions(){
	let dataTypesOptions = [<option key='' value=''></option>]
	const dataTypeIds = Object.keys(VARIABLE_DATA_TYPES)
	dataTypeIds.forEach((dtId) => {
		const dtType = VARIABLE_DATA_TYPES[dtId];
		dataTypesOptions.push(
			<option 
			key={dtType.value} 
			value={dtType.value}>
			{dtType.label}</option>
		);
	});
	return dataTypesOptions;
}


export default function VariableProperties(props) {
	const components = props.components;
	const id = props.id;
	const [name, setName] = useState(props.name);
	const [dataType, setDataType] = useState(props.dataType); 
	const [componentId, setComponentId] = useState(props.componentId);
	let [parameterId, setParameterId] = useState(props.parameterId);
	const [value, setValue] = useState(props.value);

    //Notify on variable update
    const notifyUpdateRef = useRef({updateType: null, sendUpdate: false});
    function setNotifyUpdateRef(updateType){
    	console.log("Setting notify: " +updateType)
    	notifyUpdateRef.current = updateType
    }

    useEffect(() => {
    	const updateType = notifyUpdateRef.current.updateType
    	console.log("mount notify: "+updateType)
    	if(notifyUpdateRef.current.sendUpdate){
	  		let updatedVariable = {
	  			id: id, 
	  			name: name, 
	  			dataType: dataType, 
	  			componentId: componentId, 
		        parameterId: parameterId,
		        value: value
		    }
		    props.onUpdate(updateType, id, updatedVariable);
		    notifyUpdateRef.current = {updateType: null, sendUpdate: false}
		}
    }, [name, dataType, componentId, parameterId, value]);


	//side effect to shift focus on name input
	//when a new variable is create onload
	const nameInputRef = useRef()
	const prevFocusOnNameRef = useRef(true);
	useEffect(() => {
		if(prevFocusOnNameRef.current){
			nameInputRef.current.focus();
			prevFocusOnNameRef.current = false;
		}
	}, [prevFocusOnNameRef]);

	function getComponentOptions(){
		if(!components || components.length < 1) 
			return;
		const compIds = Object.keys(components);
		let componentOptions = [<option key='' value=''></option>] 
		compIds.forEach((compId) => {
			let comp = components[compId];
			componentOptions.push(
				<option 
				key={comp.id} 
				value={comp.id}>
				{comp.name}</option>
			);
		});
		return componentOptions;
	}


	function parameterOptions(componentId) {
		let parameterOptions = null;
		const selectedComp = components[componentId];	
		const componentParameters = selectedComp.params
		if(componentParameters){
			const paramIds = Object.keys(componentParameters)
			parameterOptions = paramIds.map((p) => {
				const param = componentParameters[p];
				return <option key={param.id} value={param.id}>{param.name}</option>
			});
		}
		return parameterOptions;
	}


  	function onNameChange(evt) {
  		let newName = evt.target.value
  		newName = newName.trim().replace(/\s/g,'');
  		setName(newName)
  		setNotifyUpdateRef({updateType: 'NAME', sendUpdate: true})
  	}


  	function onDataTypeChange(evt) {
  		let newDataType = evt.target.value
  		setDataType(newDataType)
  		setNotifyUpdateRef({updateType: 'DATA_TYPE', sendUpdate: true})
  	}

	function onComponentChange(evt) {
		const newComponentId = evt.target.value;
		setComponentId(newComponentId);
		setNotifyUpdateRef({updateType: 'COMPONENT', sendUpdate: true})
  	}

  	function onParameterChange(evt) {
		const newParamId = evt.target.value;
		setParameterId(newParamId);
		setNotifyUpdateRef({updateType: 'PARAMETER', sendUpdate: true})
  	}

  	function onValueChange(evt) {
  		let newValue = evt.target.value
  		newValue = newValue.trim().replace(/\s/g,'');
  		setValue(newValue)
  		setNotifyUpdateRef({updateType: 'VALUE', sendUpdate: true})
  	}


  	const dtOptions = getDataTypesOptions();
	const compOptions = getComponentOptions();
	let paramOptions = null;
	if(componentId !== '') {
		paramOptions = parameterOptions(componentId);
	}

	if(parameterId !== ''){
		///Check if parameter belongs to the current component
		if(componentId !== '') {
			const component = components[componentId];
			if(!component.params[parameterId]){
				parameterId = '';
			}
		} else {
		 	parameterId = '';  				
		}
	}

	const disableComponentSelection = (dataType !== 'component');

    return (
      <div id="dyn-edt-var" className="dyn-var-edit-wrap">
      	<div className="var-attr form-group row">
      		<label className="var-label col-sm-2 col-form-label">Name: </label> 
      		<div className="var-input col-sm-10">
      			<input 
      				id='name' 
      				value={name} 
      				ref={nameInputRef}
      				onChange={onNameChange}
      				className="form-control form-control-sm"
      			/>
      		</div>	
      	</div>
      	<div className="var-attr form-group row">
      		<label className="var-label col-sm-2 col-form-label">Data type: </label>
      		<div className="var-input col-sm-10">
      			<select 
      				id="data-type"  
      				value={dataType}
      				onChange={onDataTypeChange}
      				className="form-control form-control-sm">
      				{dtOptions}
      			</select>
      		</div>
		</div>
		<div className="var-attr form-group row">
      		<label className="var-label col-sm-2 col-form-label">Component: </label>
      		<div className="var-input col-sm-10">
	      		<select 
	      			name="component-id" 
	      			value={componentId} 
			      	onChange={onComponentChange}
			      	disabled={ disableComponentSelection ? 'disabled' : ''} 
			      	className="form-control form-control-sm">
		      		{compOptions}
	      		</select>
	      	</div>	
		</div>
		<div className="var-attr form-group row">
      		<label className="var-label col-sm-2 col-form-label">Parameter: </label>
      		<div className="var-input col-sm-10">
	      		<select 
	      			name="parameterId" 
	      			value={parameterId}
	      			onChange={onParameterChange}
		      		disabled={ disableComponentSelection ? 'disabled' : ''} 
		      		className="form-control form-control-sm">
		      		{paramOptions}
	      		</select>
      		</div>
		</div>
		<div className="var-attr form-group row">
      		<label className="var-label col-sm-2 col-form-label">Value: </label>
      		<div className="var-input col-sm-10">
	      		<input 
	      			name="value"
	      			value={value}
	      			onChange={onValueChange} 
	      			className="form-control form-control-sm" 
	      		/>
      		</div>
		</div>
      </div>
    );
}

export {VariableProperties};
