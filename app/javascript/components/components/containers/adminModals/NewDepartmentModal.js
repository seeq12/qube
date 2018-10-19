import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactTable from 'react-table';
import { addDepartment, updateDepartmentAssignment } from '../../../utils/api.utils';
import { showErrorNotification, showInfoNotification, showSuccessNotification } from '../../../utils/notifications';

export class NewDepartmentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true,
      name: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  closeModal = () => {
    this.setState({ isShownModal: false,
      name: '' });
    this.props.handleHideModal();
  };

  doAddDepartment() {
    addDepartment(this.state.name)
      .then(()=> {
      showSuccessNotification('Department added'); this.closeModal();
    })
      .catch(() => showErrorNotification('Error adding department.'));
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [target.name]: value
    });
  }

  render() {

    return <Modal show={this.state.isShownModal} onHide={this.closeModal}>
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="flexRowContainer pb15">
          <h3 className="pb15">New Department</h3>
          <div className="width-maximum">
           <div className="flexColumnContainer mb8">
             <div className="width-100">Name</div>
             <input className="form-control input-sm mr15 width-200" name="name" value={this.state.name} type="text" onChange={this.handleInputChange}/>
           </div>
            <div className="flexColumnContainer flexFill flexJustifyEnd pt10">
              <button className="btn btn-danger mr20" onClick={this.closeModal}>Close</button>
              <button className="btn customBtn" onClick={this.doAddDepartment.bind(this)}>Add Department</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>;
  }
}

NewDepartmentModal.defaultProps = {
  handleHideModal: PropTypes.func.isRequired
};

export default NewDepartmentModal;
