
import React, { Component } from 'react';
import  {EditProperties} from './js/component/property/edit-properties'
import DynManager from './js/component/core/dyn-manager';
import ModelExplorer from './js/component/core/model-explorer';
import {describeId} from './js/common/helpers'

import './css/react-contextmenu.css';
import './css/dyn-admin.css';


function Panel(props) {
  let wrapClassName = 'panel card '; 
  if(props.className){
    wrapClassName+=props.className;
  }
  return(
    <div className={wrapClassName}>
      <div className='panel-header card-header'>{props.title}</div>
      <div className='panel-body card-body'>
        {props.render ? props.render(props.contentProps) : props.children}
      </div>
    </div>
  )
}


class DynAdmin extends Component {
  constructor(props) {
    super(props)
    this.mgr = new DynManager();
    this.model = this.mgr.createModel(1, 'Dynamic model 3');

    const var1 = this.mgr.createElement(this.model, 'page1', 'var')
    const var2 = this.mgr.createElement(this.model, 'page1', 'var')
    this.state = {
      focusOnPropertiesPanel: false,
      editProperties: { 
        focus: false, 
        contentProps: {}
      }
    };

    this.handleCreateElement = this.handleCreateElement.bind(this);
    
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
  }


  handleCreateElement = (parentElId, componentId) => {
    const element = this.mgr.createElement(this.model, parentElId, componentId);
    this.handleEditElementProps(element.id);
  }

  handleSaveProperty = (dataKey, data) => {
    console.log(`Update: ${dataKey}`)
    const idDescription = describeId(dataKey);
    this.model.set(dataKey, data);
    console.log(idDescription)
    if(idDescription.localId === 'name') {
      console.log("re- render")
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
        editProperties: { 
          focus:true, 
          contentProps: editProps
        }
    });
  }

  
  render() {    
    const editProperties = this.state.editProperties
    let propertiesPanel= {}
    if(editProperties.focus) {
      propertiesPanel.title = `${editProperties.contentProps.data.name}`
      propertiesPanel.content = <EditProperties {...editProperties.contentProps}/>
    } else {
      propertiesPanel.title = `Properties`
      propertiesPanel.content = 'No element selected'
    }

    
    return (
      <div id="dyn-admin" className="dyn-admin">
        <header id="dyn-admin-header">
        </header>
        <div className="dyn-admin-vars-warp container">
          <Panel 
            title='Project explorer' 
            className="vars-cexprs-holder"
            >
            <div className="row">
              <ModelExplorer key={this.model.id} mgr={this.mgr} 
                data={this.model.data} 
                handleElementClick={this.handleEditElementProps}
                ctxMenuActionsMap={this.ctxMenuActionsMap} />
            </div>
          </Panel>
          <Panel title={propertiesPanel.title} className='edit-props-wrap'>
              {propertiesPanel.content}
          </Panel>
        </div>  
      </div>
    );
  }



}

export default DynAdmin;
