import React from 'react';
import { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger} from "react-contextmenu";
import PropTypes from 'prop-types';
import {clone} from '../../common/helpers';


function ElementContextMenu(props) {
    const ctxMenuId = props.id;
    const elementId = props.elementId;
    const config = props.config;
    const actions = config.actions;
    const groups = config.groups;
    const menuItems = config.menuItems;

    const handleItemClick = (evt, data, target) => {
        const action = data.action;
        console.log(`Menuclicked: `)
        return actions[action].handle(evt, data, target);  
    }

    const displayMenu = [];
    groups.forEach((_group, groupIndex) => {
        const grpItems = menuItems.filter((gItem) => {
            if(gItem.group === _group.id) return gItem;
        });

        //console.log(`Group "${_group.id}" has ${grpItems.length} menus`)
        const mItems = grpItems.map((mItem, idx) => {
            const mData = {...mItem, elementId}
            return (
                <MenuItem key={`${ctxMenuId}_${idx}`} onClick={handleItemClick} data={mData}>
                    {mItem.name}
                </MenuItem>
            )
        });
        if ((_group.viewItemsInSubMenu && mItems.length > 0) || mItems.length > 1) {
            displayMenu.push(
                <SubMenu key={`${ctxMenuId}_${_group.id}`} title={_group.name}>
                    {mItems}
                </SubMenu>
            );
        } else {
            displayMenu.push(mItems);
        }
    })
    return (
        <ContextMenu id={ctxMenuId} key={ctxMenuId}>{displayMenu}</ContextMenu>
    );
}

/*ElementContextMenu.propTypes = {
    id: PropTypes.string.isRequired,
    trigger: PropTypes.shape({
        elementId: PropTypes.string.is,
        handleItemClick: PropTypes.func.isRequired,
        config: PropTypes.shape({
            actions: PropTypes.array,
            groups: PropTypes.array,
            menuItems: PropTypes.array,
        }).isRequired,
    }).isRequired
};*/

export class ModelExplorer extends React.Component {
    constructor(props) {
        super(props);
        this.mgr = props.mgr;
    }


    handleItemClick = (id) => {
        this.props.handleElementClick(id);
    }

    createTree(modelData){
        return <ul className='tree'>{this.process(modelData, 1)}</ul>
    }


    process(data, currLevel){
        const tree = [];
        if(data.id) {
            tree.push(this.treeItem(data));
            // @todo order children
            const helper = this.props.model.getComponentHelper(data.id); 
            const children = helper.getSubcomponents();
            if(children.length > 0) {
                const nextLevel = currLevel + 1;
                const childItems = [];
                children.forEach( childComponent => {
                    childItems.push(this.process(childComponent, nextLevel))
                });
                tree.push(
                    <li key={`${data.id}_${nextLevel}`} 
                        className='level-wrap' 
                        style={ {"margin": "3px 15px"} }>
                        <ul className='children'>{childItems}</ul>
                    </li>
                );
            }
        }
        return tree;
    }


    treeItem(data) {

        const menuConfig = {
            actions: this.props.menuConfig.actions,
            groups: clone(this.props.menuConfig.groups),
            menuItems: []
        }
        const menuItems = this.props.mgr.elementMenuItems(data);
        if(menuItems) {
            menuConfig.menuItems.push(...menuItems)
        }
        //console.log(`Element ${data.id}: ${menuConfig.menuItems.length}`)
        const ctxTrigger = {
            key: `MODEL_EXPLORER_${data.id}`,
            id: `MODEL_EXPLORER_${data.id}`,
            elementId: data.id,
            config: menuConfig
        }
        
        const item = (
            <li key={data.id} id={data.id} className='tree-item' >
                <ContextMenuTrigger id={ctxTrigger.id}>
                    <div className='tree-item-content'>
                        <span class='icon-title'>
                            <button onClick={ () => {this.handleItemClick(data.id)} }>
                                <span className='title'>{data.name}</span>
                            </button>
                        </span>
                    </div>
                </ContextMenuTrigger>
                <ElementContextMenu {...ctxTrigger}/>
            </li>
        );
        return item;
    }

    
    render() {
        const model = this.props.model;
        const tree = this.createTree(model.getData())
        return (
            <>{tree}</>
        );
    }
}











export default ModelExplorer;