import React, { Component } from 'react';
import  { EditProperties } from './property/edit-properties'
import DynManager from './core/dyn-manager';
import ModelExplorer from './core/model-explorer';
import { Stage } from './editor/index';
import { describeId, clone } from 'js/common/helpers'
import { _isFunction, _isEqual } from 'js/common/utils'
import { componentsConfig, componentGroups, validationRules } from '../components-config'
import { Action } from 'js/common/constants'  
import { IOParameterBinder } from './property/io-data-binder'
import Modal from './modal';

import LayoutPlanner from './core/grid-layout/layout-planner';

import 'css/react-contextmenu.css';
import 'css/dyn-admin.css';

import TEST_MODEL from "../../model1.json";

export const UIManager = {
  LAYOUT_BUILDER: "Layout",
}

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
    configName: componentId,
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
          handle: (evt, data) => {
            const id = data.elementId;
            this.handleDeleteElement([id]);
          }
      }, 
      add: {
          name:'add',
          handle: (evt, data) => {
            const parentId = data.elementId;
            const component = data.componentId
            this.handleCreateElement(parentId, component)
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

    const loadedStringModel = JSON.stringify(TEST_MODEL);
    this.mgr = new DynManager(opts);
    const model = this.mgr.loadModel(loadedStringModel);
    this.state = {
      action: Action.Load,
      actionData: null,
      model: model,
      mgr: model.mgr,
      modelId: model.id,
      focusedId: model.id,
      pageId: "mdl1.pages.page1",
      dispath: this.dispath,
      handleElementClick: this.handleEditElementProps,
      notify: this.handleActionNotification,
      openModal: false,
      modalData: null,
      propsPanelData: null,
    };

    console.log(`MODEL DATA`, JSON.stringify(this.model.getComponentHelper("mdl1.pages.page1").getNormalizedData()));
  }

  get model() {
    return this.state.model;
  }

 
  componentDidUpdate(prevProps, prevState) {
    if(this.state.action === Action.DELETE) {
      const deleted = this.mgr.deleteElement(this.model, this.state.actionData);
      this.setState({
        action: Action.DELETE_SUCCESS,
      });
    } else if(this.state.action === Action.DELETE_SUCCESS) {
      this.setState({
        action: Action.Load,
        actionData: null,
      });
    }
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
        const element = this.mgr.createLinkElement(this.model, notifData.configName, notifData.source, notifData.target);
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

  dispath = (action, payload) => {
    const { componentId } = payload;
    /*this.setState({
      action: action.type,
      ...payload
    })*/
    switch(action.type) {
      case Action.CREATED:
        return this.handleEditElementProps(componentId);
      case Action.FOCUS:
        return this.handleEditElementProps(componentId);  
      case Action.DELETE:
        return this.handleDeleteElement(componentId);
      default:
      throw new Error(`Handler not defined for action ${action.type}`)
    }
  }

  handleDeleteElement = (componentIds) => {
    // alert(`DELETE ${componentId}`)
    if(this.state.action !== Action.DELETE) {
      this.setState({
        action: Action.DELETE,
        actionData: componentIds,
      });
    }
  }

  handleCreateElement = (parentElId, componentId) => {
    if(this.mgr.isLink(this.model, componentId)) {
      this.setState({
        action: Action.FLOW_DRAW_BEGIN,
        actionData: createTransientFlowData(parentElId, componentId)
      })
    } else {
      const element = this.mgr.createElement(this.model, parentElId, componentId);
      this.handleEditElementProps(element.id);
    }

    // TODO MAP action to Ui Manager
   /* mapCompoentConfigToHandler = {
      "layout" : {
        "uiManger": UIManger.LAYOUT, 
        "create":  
      } 
    }*/
  }
  

  handleSaveProperty = (dataKey, data) => {
    // console.log(`Update: ${dataKey}`)
    const idDescription = describeId(dataKey);
    this.model.set(dataKey, data);
   
    this.setState({
      action: Action.EditProps,
    })
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
    }

    this.setState({
        action: Action.EditProps,
        focusedId: element.id,
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

  handleGenerate = () => {
    const data = this.mgr.generateModel(this.model, this.generateStartId);
    console.log(JSON.stringify(data.json))
  }
  
  toolbar() {
    return (
      <nav class="navbar navbar-light bg-light">  
        <button class="btn btn-outline-primary" type="button" onClick={this.handleLogJSON}>Log JSON</button>
        <button class="btn btn-primary" type="button" onClick={this.handleGenerate}>Generate</button>
      </nav>
    );
  }

  
  render() {       
    const modelId = this.state.model.id;
    const focusedId = this.state.focusedId;
    const propsPanelTitle = focusedId && this.state.model.getComponent(focusedId).name;
    return (
      <div id="dyn-admin" className="dyn-admin">
        <header id="dyn-admin-header">
        </header>
        <div className="">
          <div class="toolbar">
            {this.toolbar()}
          </div>
          <div className="row" style={{position: 'absolute', 'width':'100%', height:'100%'}}>
            <div className="doc docLeft col-3" style={{ padding: 0 }}>
              <Panel key={`Explorer_${this.model.id}`} title='Project explorer' className="vars-cexprs-holder" style={{height:'60%'}}>
                  <ModelExplorer key={this.model.id} 
                    {...this.state}
                    menuConfig={this.menuConfig}>
                  </ModelExplorer>
              </Panel>
              <Panel key={modelId} 
                    title={propsPanelTitle} 
                    className='edit-props-wrap' 
                    style={{height:'40%'}}>
                {this.state.propsPanelData && 
                <EditProperties key={focusedId} {...this.state.propsPanelData.props}/>}
              </Panel>
            </div> 
            <div className="doc docRight col" style={{ padding: 0 }}>
              <Panel key={`Stage${this.model.id}`} title="Stage" style={{height:'30%'}}>
               <Stage key={this.model.id} 
                    {...this.state}
                    onInitDataBinding={this.handleIOBinding}
                    notify={this.handleActionNotification}
                    menuConfig={this.menuConfig}>
                </Stage>
              </Panel>
              <Panel key={`Layout${this.model.id}`} title="Layouts and terminal panel" style={{height:'70%'}}>
                {this.state.pageId && <LayoutPlanner key={this.state.pageId} {...this.state}/>}
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
            dispath={this.dispath}
        >
          {this.state.modalData ? this.state.modalData.content : null }
        </Modal>
      </div>
    );
  }



}

export default DynAdmin;
