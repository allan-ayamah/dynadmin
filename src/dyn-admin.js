
import React, { Component } from 'react';
import  {EditProperties} from './js/component/property/edit-properties'
import DynManager from './js/component/core/dyn-manager';
import ModelExplorer from './js/component/core/model-explorer';
import { Stage } from './js/component/editor/index';
import { describeId } from './js/common/helpers'
import { componentsConfig, componentGroups, validationRules } from './js/components-config'
import { Action } from './js/component/constants'  

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

    const form1 = this.mgr.createElement(this.model, 'page1', 'form')
    this.mgr.updateComponentPos(this.model, form1.id, {
      top: 40,
      left: 30
    });
    const field1 = this.mgr.createElement(this.model, 'page1.form1', 'fld')
    const selectionField1 = this.mgr.createElement(this.model, 'page1.form1', 'sfld')

    const query1 = this.mgr.createElement(this.model, 'page1', 'query');
    this.mgr.updateComponentPos(this.model, query1.id, {
      top: 70,
      left: 270
    });

    const flow1 = this.mgr.createElement(this.model, 'page1.form1', 'flow')
    flow1.source=form1.id;
    flow1.target=query1.id;
    //console.log(this.model.data)
    const var1 = this.mgr.createElement(this.model, 'page1', 'var')
    const var2 = this.mgr.createElement(this.model, 'page1', 'var')

    this.state = {
      action: Action.Load,
      actionData: null,
      propsPanelData: null,
    };

    this.handleCreateElement = this.handleCreateElement.bind(this);

  }

  handleCreateElement = (parentElId, componentId) => {
    const element = this.mgr.createElement(this.model, parentElId, componentId);
    this.handleEditElementProps(element.id);
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
              <Panel title='Project explorer' className="vars-cexprs-holder" style={{height:'60%'}}>
                  <ModelExplorer key={this.model.id} 
                    action={this.state.action}
                    actionData={this.state.actionData}
                    mgr={this.mgr} 
                    data={this.model.data} 
                    handleElementClick={this.handleEditElementProps}
                    menuConfig={this.menuConfig}>
                  </ModelExplorer>
              </Panel>
              <Panel title={propertiesPanel.title} 
                    className='edit-props-wrap' 
                    style={{height:'40%'}}>
                {propertiesPanel.content}
              </Panel>
            </div> 
            <div className="doc docRight col-8" style={{ padding: 0 }}>
              <Panel title="Stage" style={{height:'80%'}}>
                <Stage key={this.model.id} 
                    mgr={this.mgr}
                    action={this.state.action}
                    actionData={this.state.actionData} 
                    model={this.model}
                    data={this.model.data} 
                    handleElementClick={this.handleEditElementProps}
                    menuConfig={this.menuConfig}>
                </Stage>
              </Panel>
              <Panel title="Layouts and terminal panel" style={{height:'20%'}}>
                Layout contents
              </Panel>
            </div>
          </div>
        </div>
      </div>
    );
  }



}

export default DynAdmin;
