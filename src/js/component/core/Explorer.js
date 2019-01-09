export class Explorer extends React.Component {
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
            menuItems: [{
                name: "Delete",
                action: "delete",
                group: "delete",
            }]
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
        const tree = this.createTree(this.props, element)
        return (
            <>{tree}</>
        );
    }
}