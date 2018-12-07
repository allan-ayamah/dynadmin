import React, { Component } from 'react';
import  { EditProperties } from './js/component/property/edit-properties'
import DynManager from './js/component/core/dyn-manager';
import ModelExplorer from './js/component/core/model-explorer';
import { Stage } from './js/component/editor/index';
import { describeId } from './js/common/helpers'
import { componentsConfig, componentGroups, validationRules } from './js/components-config'
import { Action } from './js/component/constants'  
import { IODataBinder, getIODataBinderTestData } from './js/component/property/io-data-binder'
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
    this.mgr.updateComponentPos(this.model, 'page1', {
      top: 40,
      left: 0
    });

    const form1 = this.mgr.createElement(this.model, 'page1', 'form')
    this.mgr.updateComponentPos(this.model, form1.id, {
      top: 0,
      left: 0
    });
    const field1 = this.mgr.createElement(this.model, 'page1.form1', 'fld')
    const selectionField1 = this.mgr.createElement(this.model, 'page1.form1', 'sfld')

    const query1 = this.mgr.createElement(this.model, 'page1', 'query');
    this.mgr.updateComponentPos(this.model, query1.id, {
      top: 0,
      left: 0
    });
    this.mgr.createElement(this.model, 'page1.query1', 'qryI');
    this.mgr.createElement(this.model, 'page1.query1', 'qryI');

    const flow1 = this.mgr.createElement(this.model, 'page1.form1', 'flow')
    flow1.source=form1.id;
    flow1.target=query1.id;
    //console.log(this.model.data)
    const var1 = this.mgr.createElement(this.model, 'page1', 'var')
    const var2 = this.mgr.createElement(this.model, 'page1', 'var')

    this.state = {
      action: Action.Load,
      actionData: null,
      openModal: false,
      modalData: null,
      propsPanelData: null,
    };

    this.handleCreateElement = this.handleCreateElement.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
   
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
    
    const flowData = this.model.get(flowDataId);
    const srcO = this.mgr.getElementIO(this.model, flowData.source).output;
    const trgI = this.mgr.getElementIO(this.model, flowData.target).input;
    
    const binderProps = {
      key: flowData.id,
      parameters: flowData,
      source: this.model.get(flowData.source),
      target: this.model.get(flowData.target),
      sourceData: srcO,
      targetData: trgI,
    }
    this.setState({
      openModal: true,
      modalData: (
          <IODataBinder {...binderProps}/>
      ),
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

  handleSaveAndCloseModal = () => {
    this.handleCloseModal();
  }

  handleCloseModal = () => {
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
    const element = Object.assign({}, this.model.get(elementId));
    const componentId = element.meta.componentId;
    const componentConf = this.mgr.getConfigByName(componentId);
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
          <div className="row" style={{position: 'absolute', 'width':'100%', height:'100%'}}>
            <div className="doc docLeft col-4" style={{ padding: 0 }}>
              <Panel key={`Explorer_${this.model.id}`} title='Project explorer' className="vars-cexprs-holder" style={{height:'60%'}}>
                  <ModelExplorer key={this.model.id} 
                    action={this.state.action}
                    actionData={this.state.actionData}
                    mgr={this.mgr} 
                    data={this.model.data} 
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
                    data={this.model.data} 
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
            onClose={this.handleCloseModal}
            onSave={this.handleSaveAndCloseModal}
        >
          {this.state.modalData}
        </Modal>
      </div>
    );
  }



}

export default DynAdmin;
