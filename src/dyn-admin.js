import React, { Component } from 'react';
import  { EditProperties } from './js/component/property/edit-properties'
import DynManager from './js/component/core/dyn-manager';
import ModelExplorer from './js/component/core/model-explorer';
import { Stage } from './js/component/editor/index';
import { describeId, clone } from './js/common/helpers'
import { _isFunction, _isEqual } from './js/common/utils'
import { componentsConfig, componentGroups, validationRules } from './js/components-config'
import { Action } from './js/component/constants'  
import { IOParameterBinder } from './js/component/property/io-data-binder'
import Modal from './js/component/modal';

import './css/react-contextmenu.css';
import './css/dyn-admin.css';


function Panel(props) {
  let wrapClassName = ['panel','card', props.className]; 
  return(
    <div className={wrapClassName.join(' ')} style={props.style}>
      <div className='panel-header card-header'>{props.title}</div>
      <div className='panel-body card-body' style={{overflow: 'auto', position: 'relative'}}>
        <div style={{ position: '' }}>
        {props.render ? props.render(props.contentProps) : props.children}
        </div>
      </div>
    </div>
  )
}

export const TRANSIENT_FLOW_DATA_ID = "TRANSIENT_FLOW_DATA_ID";
function createTransientFlowData(sourceId, componentId) {
  return {
    id: TRANSIENT_FLOW_DATA_ID,
    componentId: componentId,
    source: sourceId,
    target: "",
  }
}

class DynAdmin extends Component {
  constructor(props) {
    super(props)
    
    this.ctxMenuActionsMap = {
      copy: {
          name: 'copy',
          handle: (model, data) => {
              console.log("COPY")
              console.log(data)
          },
      }, 
      paste: {
          name: 'paste',
      },
      delete: {
          name: 'delete',
          
      }, 
      add: {
          name:'add',
          handle: (evt, data) => {
            const parentId = data.elementId;
            const compoenent = data.componentId
            this.handleCreateElement(parentId, compoenent)
          }
      } 
    }
    const actionGroups = [
      {
           id: 'copy',
           name: 'Copy'
       },
       {
           id: 'paste',
           name: 'Paste'
       },
       {
           id: 'delete',
           name: 'Delete'
       },
       {
           id: 'add', 
           name: 'Add',
           viewItemsInSubMenu: true,
       }
    ];
    actionGroups.push(...componentGroups);
    this.menuConfig = {
      actions: this.ctxMenuActionsMap,
      groups: actionGroups,
    }

    const opts = {
      components: [...componentsConfig, ...validationRules],
    }

    this.mgr = new DynManager(opts);
    this.model = this.mgr.createModel(1, 'Dynamic model 3');
    const page1 = this.model.get('mdl1.pages.page1')

    this.mgr.updateComponentPos(this.model, this.model.id, {
      top: 26,
      left: 0,
      minWidth: 565.926,
      minHeight: 281.773,
    });

    this.mgr.updateComponentPos(this.model, page1.id, {
      top: 26,
      left: 0,
      minWidth: 545.926,
      minHeight: 198.773,
    });

    const form1 = this.mgr.createElement(this.model, page1.id, 'form')
    console.log("HERE", form1)
    this.mgr.updateComponentPos(this.model, form1.id, {
      top: 36,
      left: 107
    });
    const field1 = this.mgr.createElement(this.model, form1.id, 'fld')
    const selectionField1 = this.mgr.createElement(this.model, form1.id, 'sfld')

    const query1 = this.mgr.createElement(this.model, page1.id, 'query');
    this.mgr.updateComponentPos(this.model, query1.id, {
      top: 30,
      left: 359,
    });
    this.mgr.createElement(this.model, query1.id, 'qryI');
    this.mgr.createElement(this.model, query1.id, 'qryI');
    
    const flow1 = this.mgr.createElement(this.model, query1.id, 'flow')
    flow1.source=form1.id;
    flow1.target=query1.id;
   
    const var1 = this.mgr.createElement(this.model, page1.id, 'var')
    const var2 = this.mgr.createElement(this.model, page1.id, 'var')

     //console.log(this.model.data)
    this.state = {
      action: Action.Load,
      actionData: null,
      openModal: false,
      modalData: null,
      propsPanelData: null,
    };

    this.handleCreateElement = this.handleCreateElement.bind(this);
    console.log(`MODEL DATA`, clone(this.model.data))
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(nextState.openModal !== this.state.openModal) {
      return true;
    }
    
    if(nextState.action !== this.state.action) {
      switch(nextState.action) {
        case Action.Load: {
            return false;
        }
        default:
        break;
      }
    }
    return true;
  }


  handleActionNotification = (type, notifData) => {
    console.log(`Handle notification: ${type}`, notifData)
    switch(type) {
      case Action.FLOW_DRAW_END: {
        const element = this.mgr.createElement(this.model, notifData.source, notifData.componentId);
        element.source = notifData.source;
        element.target = notifData.target;
        this.setState({
          action: Action.Load,
          actionData: null,
        }, 
        () => this.handleEditElementProps(element.id)
        )
        break;
      }
      case Action.FLOW_DRAW_ABORT: {
        this.setState({
          action: Action.Load,
          actionData: null,
        })
        break;
      }
      default:
      break;
    }
  }

  handleIOBinding = (flowDataId) => {
    const model = this.model;
    const flowData = model.get(flowDataId);
    const srcO = this.mgr.getElementIO(this.model, flowData.source).output;
    const tgtI = this.mgr.getElementIO(this.model, flowData.target).input;
    
    const panelContentRefs = new Map();
    const registerPanelContent = function(id, instanceRef) {
      if(instanceRef === null || instanceRef === undefined) {
          return;
      }
      panelContentRefs.set(id, instanceRef);
    }

    const hasUnsavedChanges = function() {
      const errorsMap = new Map()
      let failed = false;
      panelContentRefs.forEach((contentInstance, contentId) => {
        if(contentInstance.hasUnsavedChanges()) {
          errorsMap.set(contentId, ["Has unsaved changes"])
          failed = true;
        }
      })
      return {
        failed: failed,
        errors: errorsMap
      }
    }

    const handleIOSave = function() {
      const allNewPropagations = []
      panelContentRefs.forEach((contentInstance, contentId) => {
        const newPropagations = contentInstance.save();
        allNewPropagations.push(...newPropagations)
      })

      // @todo use command pattern for feature "undo/redo"
      const oldFlowData = model.copy(flowDataId);
      console.log(`Old flow data`, oldFlowData);
      model.get(flowDataId).propagations = allNewPropagations;
      const newFlowData =  model.get(flowDataId);
      console.log(`New flow data`, newFlowData);
    }

    const binderProps = {
      contentId: flowDataId.id,
      kdey: flowData.id,
      flowData: flowData,
      sourceParams: srcO,
      targetParams: tgtI,
      propagations: flowData.propagations || [],
      sourceTitle: this.model.get(flowData.source).name,
      targetTitle: this.model.get(flowData.target).name,
    }

    this.setState({
      openModal: true,
      modalData: {
        validateCancel: hasUnsavedChanges,
        onConfirmCancel: null,
        onSave: handleIOSave,
        content: (
          <IOParameterBinder {...binderProps}
            ref={instance => registerPanelContent(binderProps.contentId, instance)} />
        )
      },
    })

    /*<NavTab key={`NAV_T_${flowDataId}`}>
      <TabPane id={`TP_${flowDataId}`} title={"Data binding"}>
        <IODataBinder key={flowDataId} source={srcO} target={trgI}/>
      </TabPane>
    </NavTab>*/
    //<IODataBinder key={'IOBINDER'} {...getIODataBinderTestData()} />,
    /*const panelConfig = {
      closable: true,
      panels: {
        IOBinding: {
          title: 'Data binding',
          render: (cntProps) => {
            return (
              <IODataBinder 
                key={flowDataId} 
                source={srcO} 
                target={trgI}
                />
            );
          }
        } 
      }
    }*/
  }

  isModalActive = () => {
    return this.state.openModal;
  }

  handleSaveAndCloseModal = () => {
    
    console.log(`Handle modal save and close`)
    if(this.isModalActive()) {
      const { modalData } = this.state;
      if(modalData.onSave) {
        modalData.onSave()
      }
      this.handleCloseModal()
    }
  }

  handleCancelModal = () => {
    console.log(`handleCloseOnlyModal`)
    if(this.isModalActive()) { 
      const { modalData } = this.state;
      if(_isFunction(modalData.validateCancel)) {
        const validationResult = modalData.validateCancel();
        if(validationResult.failed) {
          alert(`Failed validation cancel`)
          // @todo show confirm dialog
        } else {
          this.handleCloseModal();
        }
      } else {
        this.handleCloseModal();
      }
    }
  }

  handleCloseModal = () => {
    console.log(`Do close`)
    this.setState({
      action: Action.Load,
      openModal: false,
      modalData: null,
      actionData: null,
    })
  }

  handleCreateElement = (parentElId, componentId) => {
    if(this.mgr.isConfigFlowType(componentId)) {
      this.setState({
        action: Action.FLOW_DRAW_BEGIN,
        actionData: createTransientFlowData(parentElId, componentId)
      })
    } else {
      const element = this.mgr.createElement(this.model, parentElId, componentId);
      this.handleEditElementProps(element.id);
    }
  }
  

  handleSaveProperty = (dataKey, data) => {
    // console.log(`Update: ${dataKey}`)
    const idDescription = describeId(dataKey);
    this.model.set(dataKey, data);
    if(idDescription.localId === 'name') {
      this.handleEditElementProps(idDescription.parentId);
    }
  }

  handleEditElementProps = (elementId) => {
    const element = this.model.get(elementId);
    const componentConf = this.mgr.getConfigByName(element.meta.configName);
    const attrConfig = componentConf.properties;
    const dataKeys = {}
    Object.keys(attrConfig).forEach(propName => {
        return dataKeys[propName] =  `${elementId}.${propName}`;
    })
    const editProps = {
      key: element.id,
      id: element.id,
      data: element,
      dataKeys: dataKeys,
      handleSaveProperty: this.handleSaveProperty,
      attrConfig: attrConfig,
      mgr: this.mgr,
      model: this.model
    }

    this.setState({
        action: Action.EditProps,
        actionData: editProps,
        propsPanelData: {
          title: editProps.data.name,
          props: editProps,
        },
    });
  }

  handleLogJSON = () => {
    console.log(JSON.stringify(this.model.json))
  }
  
  toolbar() {
    return (
      <nav class="navbar navbar-light bg-light">  
        <button class="btn btn-outline-primary" type="button" onClick={this.handleLogJSON}>Log JSON</button>
      </nav>
    );
  }

  
  render() {    
    let propertiesPanel= {}
    if(this.state.propsPanelData) {
      propertiesPanel = {
        title: `${this.state.propsPanelData.title}`,
        content: <EditProperties {...this.state.propsPanelData.props}/>
      }
    } else {
      propertiesPanel = {
        title: `Properties`,
        content: `No element selected`,
      }
    }

    
    return (
      <div id="dyn-admin" className="dyn-admin">
        <header id="dyn-admin-header">
        </header>
        <div className="">
          <div class="toolbar">
            {this.toolbar()}
          </div>
          <div className="row" style={{position: 'absolute', 'width':'100%', height:'100%'}}>
            <div className="doc docLeft col-4" style={{ padding: 0 }}>
              <Panel key={`Explorer_${this.model.id}`} title='Project explorer' className="vars-cexprs-holder" style={{height:'60%'}}>
                  <ModelExplorer key={this.model.id} 
                    action={this.state.action}
                    actionData={this.state.actionData}
                    mgr={this.mgr} 
                    model={this.model} 
                    handleElementClick={this.handleEditElementProps}
                    notify={this.handleActionNotification}
                    menuConfig={this.menuConfig}>
                  </ModelExplorer>
              </Panel>
              <Panel key={`Props${this.model.id}`} title={propertiesPanel.title} 
                    className='edit-props-wrap' 
                    style={{height:'40%'}}>
                {propertiesPanel.content}
              </Panel>
            </div> 
            <div className="doc docRight col-8" style={{ padding: 0 }}>
              <Panel key={`Stage${this.model.id}`} title="Stage" style={{height:'70%'}}>
               <Stage key={this.model.id} 
                    mgr={this.mgr}
                    action={this.state.action}
                    actionData={this.state.actionData} 
                    model={this.model}
                    handleElementClick={this.handleEditElementProps}
                    onInitDataBinding={this.handleIOBinding}
                    notify={this.handleActionNotification}
                    menuConfig={this.menuConfig}>
                </Stage>
              </Panel>
              <Panel key={`Layout${this.model.id}`} title="Layouts and terminal panel" style={{height:'30%'}}>
                Layouts
              </Panel>
            </div>
          </div>
        </div>
        <Modal key={`MODAL_${this.state.openModal}`}
            isOpen={this.state.openModal} 
            modalBackdrop={this.props.modalBackdrop}
            modalRoot={this.props.modalRoot}
            onClose={this.handleCancelModal}
            onSave={this.handleSaveAndCloseModal}
        >
          {this.state.modalData ? this.state.modalData.content : null }
        </Modal>
      </div>
    );
  }



}

export default DynAdmin;
