import React from 'react';
import SelectOrCreate, { NO_SELECTION_VALUE, NO_SELECTION_LABEL } from "./select-or-create";
import { StringUtils } from "../../common/utils";


function transformSelectCreateResult(result) {
    if(result.isSelected) {
        return {
            sourceParam: result.selectedValue,
        }
    }
    return {
        constantSourceValue: result.inputValue
    }
}

export default class IODataBinder extends React.Component {
    constructor(props) {
        super(props);
        this.isDebugEnabled =  true;
        this.state = {
            flowData: this.props.flowData,
            sourceParams: this.props.sourceParams,
            targetParams: this.props.targetParams,
            propagations: this.props.propagations,
        }
        
        this.selectRefs = new Map();
        // Map<String, Propagation>
        // map that contains the initial propagation of all target parameters
        this.targetParamMap = new Map();
    }

    /**
     * Return true is the propagation object is valid
     * @param {Propagation} propagation -- the propgation object
     */
    isPropagationValid = (propagation) => {
        return !StringUtils.isBlank(propagation.sourceParam) 
                ||  !StringUtils.isBlank(propagation.constantSourceValue)
    }

    /**
     * Returns true if 
     */
    hasUnsavedChanges = () => {
        const iter = this.selectRefs.values();
        let selectInfo = iter.next().value
        while(selectInfo !== undefined) {
            if(selectInfo.instance.hasValueChanged()){
                this.logDebug(`Propagation to targetParam "${selectInfo.targetParamId}" has un saved changes`)
                return true;
            }
            selectInfo = iter.next().value
        }
        return false;
    }

    save = () => {
        const _this = this;
        const newPropagations = []
        const updatePropagation = function(targetParamId, result) {
            const newPropagation = Object.assign(result, {
                targetParam: targetParamId
            })
            if(_this.isPropagationValid(newPropagation)) {
                _this.logDebug(`Update propagation result [targetParam: ${targetParamId}]`, newPropagation)
                newPropagations.push(newPropagation); 
            } else {
                _this.logDebug(`Remove propagation [targetParam: ${targetParamId}]`, newPropagation)
            }
        }

        const savePropagation = function(targetParamId, result) { 
            const newPropagation = Object.assign(result, {
                targetParam: targetParamId
            })
            
            if(_this.isPropagationValid(newPropagation)) {
                _this.logDebug(`Save propagation [targetParam: ${targetParamId}]`, newPropagation)
                newPropagations.push(newPropagation); 
            } else {
                _this.logDebug(`INVALID propagation [targetParam: ${targetParamId}]`, newPropagation)
            }
        }
        this.selectRefs.forEach(( selectInfo, id) => {
            const targetParamId = selectInfo.targetParamId;
            const result = selectInfo.instance.getResult();
            if(selectInfo.isPreloaded) {
                updatePropagation(targetParamId, result) 
            } else {
                savePropagation(targetParamId, result);
            }
        });
        return newPropagations;
    }

    //Do nothing
    abortChanges = () => {
        return true;
    }

    close = () => {

    }


    getSourceParamsOptions = () => {
        if(this.sourceOptions) 
            return this.sourceOptions;

        const tempOptions = [
            {
                value: NO_SELECTION_VALUE,
                label: NO_SELECTION_LABEL
            }
        ]
        this.state.sourceParams.forEach( param => {
            tempOptions.push({
                value: param.id,
                label: param.label
            })
        });
        this.sourceOptions = tempOptions;
        console.log(`First options: `, this.sourceOptions)
        return this.sourceOptions;
    }

    registerSelectRef = (targetParamId, instanceRef, isPreloaded) => {
        if(instanceRef === undefined || instanceRef === null) {
            return;
        }
        console.log(`Register select ref for targetParam "${targetParamId}"`, instanceRef)
        this.selectRefs.set(targetParamId, { 
            targetParamId: targetParamId,
            isPreloaded: isPreloaded,
            instance: instanceRef,
        });
    }

    initSourceParamSelect(tgtData) {
        const targetParamId = tgtData.id;
        const selectProps = {
            id: targetParamId,
            options: this.getSourceParamsOptions(),
            resultTransformer: transformSelectCreateResult,
        };
        // find preloaded propagation for targetParam
        const propagation = this.state.propagations.find( propagation => {
            return propagation.targetParam === targetParamId;
        });
        const isPreloaded = propagation ? true : false;
        if(isPreloaded) {
            if(!StringUtils.isBlank(propagation.sourceParam)) {
                // preload with constant
                selectProps.selectedValue = propagation.sourceParam
            } else if(!StringUtils.isBlank(propagation.constantSourceValue)) {
                // input constant value
                selectProps.inputValue = propagation.constantSourceValue
            }
        }

        this.targetParamMap.set(targetParamId, propagation);
        return (
            <SelectOrCreate key={targetParamId} 
                ref={instance => this.registerSelectRef(selectProps.id, instance, isPreloaded)} {...selectProps} />
        );
    }


    logDebug() {
        if(this.isDebugEnabled) {
            console.log(...arguments)
        }
    }
    
    render() {
        const targetParams = this.state.targetParams;
        return (
            <table className="table table-bordered table-hover table-sm">
                <thead>
                    <tr>
                        <th>Source({this.props.sourceTitle})</th>
                        <th>Target({this.props.targetTitle})</th>  
                    </tr>
                </thead>
                <tbody>
                    {targetParams.map(tgtData => {
                        const srcSelect = this.initSourceParamSelect(tgtData);
                        const targetLabel = tgtData.label;
                        return (
                            <tr key={tgtData.id}>
                                <td>{srcSelect}</td>
                                <td>{targetLabel}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        );
    }
}

const flowData = {
    id: 'flow2',
    source: 'form1',
    target: 'query1',
    propagations: [
        {
            sourceParam: 'fld2',
            targetParam: 'qi2',
        },
        {
            constantSourceValue: 'Allan',
            targetParam: 'qi1',
        }
    ]
}

const propagations = flowData.propagations;

const sourceParams = [
    {
        label: 'Cognome',
        id: 'fld1',
    }, 
    {
        label: 'Nome',
        id: 'fld2',
    }
];   

const targetParams = [
    {
        label: 'Cognome Query Input',
        id: 'qi1'
    }, 
    {
        label: 'Nome Query Input',
        id: 'qi2'
    }
];

function getIODataBinderTestData() {
    return {
        flowData,
        sourceParams,
        targetParams,
        propagations
    }
}

class IOParameterBinderTest extends React.Component {
    constructor(props) {
        super(props)
        this.paramBinders = new Map;
    }

    
   registerBinder(id, instanceRef) {
       if(instanceRef === null || instanceRef === undefined) {
           return;
       }
       this.paramBinders.set(id, instanceRef);
   }


   dispatch = (actionType) => {
       console.log(`Dispatch action: ${actionType}`)
       if(actionType === "SAVE") {
            this.paramBinders.forEach((binderInstance, id) => {
                binderInstance.save();
            })
       } else if(actionType === "CHECK_VALUES_STATUS") {
        this.paramBinders.forEach((binderInstance, id) => {
            const result = binderInstance.hasUnsavedChanges();
            console.log(`ParameterBinder["${id}"] hasUnsavedChanges: ${result}`)
        })
       }
   }
    

    render() {
        const testDataProps = {
            flowData,
            sourceParams,
            targetParams,
            propagations,
            sourceTitle: "FormTest",
            targetTitle: "Query Test"
       }

       return (
            <>
                <IODataBinder key={"test-io-binding-1"}
                    ref={ instance => this.registerBinder("test-io-binding-1", instance)} {...testDataProps}/>
                <div>
                    <button onClick={()=> this.dispatch("CANCEL")}>Cancel</button>
                    <button onClick={() => this.dispatch("CHECK_VALUES_STATUS")}>HasUnsavedChanges</button>
                    <button onClick={() => this.dispatch("SAVE")}>Save</button>

                </div>
            </>
        );
 
    }
}

export { 
    IODataBinder,
    IODataBinder as IOParameterBinder, 
    IOParameterBinderTest, 
    getIODataBinderTestData
}