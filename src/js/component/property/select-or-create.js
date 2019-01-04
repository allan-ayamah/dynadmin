import React, { useEffect, useState, useRef, useImperativeMethods } from 'react';
import { StringUtils } from "../../common/utils";
import "./select-create.css"


const NO_SELECTION_VALUE = "";
const NO_SELECTION_LABEL = "";

function DropdownList(props) {
  const { options } = props;
  const [ show, setShow ] = useState(props.show);
  useEffect(() => {
      setShow(props.show)
  }, [props.show]);
 
  const renderLabel = (label, value) => {
    return label;
  };

  const handleChoose = (option) => {
    props.onSelect(option.value, option.label, option)
  };
  
  if(!show) {
    return "";
  }

  return (
      <div className="select-menu-outer">
        <div className="select-menu">
            {options.map(option => {
                return (
                <div key={option.value}
                    className={option.value !== NO_SELECTION_VALUE ?  "select-option" : "select-option no-selection" }
                    data-value={option.value}
                    onClick={(e) => handleChoose(option)}
                >
                    {renderLabel(option.label, option.value)}
                </div>
                );
            })}
        </div>
    </div>
  );
}

export default function SelectOrCreate(props, ref) {
    const options = useRef(props.options || []).current;
    const [initialValues, setInitialValues] =  useState({
        selectedValue: props.selectedValue || "",
        inputValue: props.inputValue || "",
        isSelected : !StringUtils.isBlank(props.selectedValue) 
                    || props.selectedValue !== NO_SELECTION_VALUE
    })
    const [inputValue, setInputValue] = useState(initialValues.inputValue);
    const [isInputActive, activateInput] = useState(!initialValues.isSelected);
    const [showDropdown, setShowDropdown] = useState(false)
    const [selected, setSelected] = useState({ 
      value: initialValues.selectedValue, 
      label: props.selectedLabel || "" 
    });
    useEffect(() => {
      if(selected.value) {
        if(isInputActive) {
          activateInput(false);
        }
        if(selected.label === NO_SELECTION_LABEL) {
            const selectedOption = options.find(option => {
                return option.value === selected.value && option.label;
            });
            if(selectedOption) {
                setSelected({
                    value: selectedOption.value,
                    label: selectedOption.label,
                })
            } else {
                console.error(`Could not find option for value: ${selected.value}`)
            }
        }
      } else {
         if(!isInputActive) 
           activateInput(true);
      }
    }, [selected.value, selected.label]);

    const handleItemSelect = (newValue, label) => {
        if(newValue !== selected.value) {
          const newLabel = newValue !== "" ? label : ""; 
          console.log(`Select item value: ${newValue}`)
          setSelected({ value: newValue, label:  newLabel })
        }
        if(showDropdown) {
          setShowDropdown(false);
        }
    }

    const getActualResult = function() {
        if(selected.value !== NO_SELECTION_VALUE) {
            return {
                isSelected: true, 
                selectedValue: selected.value,
                selectedLabel: selected.label
            };
        }

        return {
            isSelected: false,
            inputValue: inputValue,
        };
    }
    const resultTransformer = props.resultTransformer || function(actualResult) { return actualResult }; 
    useImperativeMethods(ref, () => ({
        getResult: () => {
            return resultTransformer(getActualResult())
        },
        hasValueChanged: function() {
            const actualResult = getActualResult();
            console.log(actualResult, initialValues)
            if(actualResult.isSelected) {
                return !(actualResult.selectedValue === initialValues.selectedValue);
            }
            return !(actualResult.inputValue === initialValues.inputValue) 
        }
    }));
    
    const renderSelectedLabel = () => {
      const label = selected.label;
      if(label) {
        return (
          <span className="selected-value-label">
            {label}
            </span>
        );  
      }
      return "";
    }
    
    const id = props.id;
    return (
        <div className="select-create">
            <div className="select-control">
                <span className="select-value-wrapper">
                    {renderSelectedLabel()}
                    <div className="select-input" 
                        style={{display: isInputActive ? "block" : "none"}}>
                        <input name={id} 
                            type={"string"}
                            disabled={!isInputActive ? "disabled" : ""}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)} />
                    </div>
                </span>
                <span className="select-arrow-zone" 
                    onClick={() => setShowDropdown(prevShowDropdown => !prevShowDropdown)}>
                    <span className="select-arrow"></span>
                </span>  
            </div>
            <DropdownList key={id} 
                show={showDropdown} 
                options={options} 
                onSelect={handleItemSelect}/>
        </div>
     );
  }
  
SelectOrCreate = React.forwardRef(SelectOrCreate);


function SelectOrCreateTest(props) {
  const options = [
    { value: "", label: " " },
    { value: "a", label: "First select option" },
    { value: "b", label: "Second select option" }
  ];

 const selectInstances = [
     {
        selectedValue: "a",
     },{

     },{

     }
 ]
  
  const selectRefs = React.useRef(new Map()).current
  const registerSelect = function(selectId, instanceRef) {
      if(instanceRef === undefined || instanceRef === null) {
          return;
      }
      console.log(`Register select instance ${selectId}`, instanceRef)
      selectRefs.set(selectId, instanceRef);
  }

  const collectValues = function() {
    selectRefs.forEach((instanceRef, id) => {
        const values = instanceRef.getResult();
        console.log(`Values for "${id}"`, values)
    });
  }

  useEffect(() => {
    console.log("Test di mount", selectRefs.lenth)
    setTimeout(collectValues, 200)    
  }, [])
  
  return (
    selectInstances.map( (selInst, idx) => {
        return <SelectOrCreate key={idx} id={idx} ref={inst => registerSelect(idx, inst)} options={options} {...selInst}/>
    })
  )
}


export { 
    SelectOrCreate, 
    NO_SELECTION_VALUE, 
    NO_SELECTION_LABEL, 
    SelectOrCreateTest
}