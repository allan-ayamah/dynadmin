import React from 'react';
import ReactDOM from 'react-dom';

export default class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isOpen : this.props.isOpen
    }
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  
  }
  
  render() {
    if(this.state.isOpen) {
      this.props.modalBackdrop.className = "modal-backdrop show";
    } else {
      this.props.modalBackdrop.className = "";
    }
      return(
        <div ref={el=> this.el= el} 
            style={ this.state.isOpen ? { display: "block" } : null}
            className="modal modal-open show fade" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{this.props.title}</h5>
              </div>
              <div className="modal-body">
                {this.props.children}
              </div>
              <div className="modal-footer">
                <button onClick={this.props.onClose} type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                <button onClick={this.props.onSave} type="button" className="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      );
  }
}