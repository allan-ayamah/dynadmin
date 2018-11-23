import React from 'react';
import { ContextMenu, MenuItem, SubMenu, ContextMenuTrigger} from "react-contextmenu";
import PropTypes from 'prop-types';
import {clone} from '../../common/helpers';




const menuConfig = {
    actions: [ 
        'copy', 
        'paste', 
        'delete', 
        'add', 
    ],
    groups: [
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
            viewItemInSubMenu: true,
        }
    ],
    menuItems: [
        {
            name: 'Copy',
            action: 'copy',
            group: 'copy',
        }
    ]
};



function ModelElementCtxMenu(props) {
    const ctxMenuId = props.id;
    const elementId = props.elementId;
    const config = props.config;
    const actions = config.actions;
    const groups = config.groups;
    const menuItems = config.menuItems;
    const handleItemClick = props.handleItemClick;


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
        if (_group.viewItemInSubMenu || mItems.length > 1) {
            displayMenu.push(
                <SubMenu key={`${ctxMenuId}_SM`} title={_group.name}>{mItems}</SubMenu>
            );
        } else {
            displayMenu.push(mItems);
        }
    })
    return (
        <ContextMenu id={ctxMenuId} key={ctxMenuId}>{displayMenu}</ContextMenu>
    );
}

/*ModelElementCtxMenu.propTypes = {
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

    handleCtxMenuItemClick = (evt, data, target) => {
        const action = data.action;
        console.log(`Menuclicked: `)

        const handle = this.props.ctxMenuActionsMap[action].handle;
        handle(evt, data, target)    
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
            const children = this.mgr.findElements(data);
            if(children.length > 0) {
                const nextLevel = currLevel + 1;
                const childItems = [];
                children.forEach( childComponent => {
                    childItems.push(this.process(childComponent, nextLevel))
                });
                tree.push(
                    <li key={`${data.id}_${nextLevel}`} className='level-wrap'>
                        <ul className='children'>{childItems}</ul>
                    </li>
                );
            }
        }
        return tree;
    }


    treeItem(data) {
        console.log("COnfig 4: "+data.id)
        
        const menuItems = this.props.mgr.elementMenuItems(data);
        console.log(menuItems.length)
        console.log(`BEFORE MERGE: ${menuConfig.menuItems.length}`)
        const elementMenuConfig = clone(menuConfig)
        
        if(menuItems) {
            elementMenuConfig.menuItems.push(...menuItems);
        }
        console.log(`AFTER MERGE: ${menuConfig.menuItems.length}`)
        const ctxTrigger = {
            key: `MODEL_EXPLORER_${data.id}`,
            id: `MODEL_EXPLORER_${data.id}`,
            handleItemClick: this.handleCtxMenuItemClick,
            elementId: data.id,
            config: elementMenuConfig
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
                <ModelElementCtxMenu {...ctxTrigger}/>
            </li>
        );
        return item;
    }

    
    render() {
        const modelData = this.props.data;
        const tree = this.createTree(modelData)
        return (
            <>{tree}</>
        );
    }
}











export default ModelExplorer;