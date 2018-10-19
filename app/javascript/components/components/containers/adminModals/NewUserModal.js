import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { addUser } from '../../../utils/api.utils';
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifications';

export class NewUserModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true,
      firstName: '',
      lastName: '',
      email: '',
      departmentId: '',
      homeRoomId: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.doAddUser = this.doAddUser.bind(this);
  }

  closeModal = () => {
    this.setState({ isShownModal: false,
      firstName: '',
      lastName: '',
      email: '',
      departmentId: '',
      homeRoomId: '' });
    this.props.handleHideModal();
  };

  doAddUser() {
    return addUser({
      name: this.state.firstName,
      last_name: this.state.lastName,
      first_name: this.state.firstName,
      email: this.state.email,
      department_id: this.state.department_id })
       .then(()=> {
      showSuccessNotification('User added'); this.closeModal();
    })
       .catch(() => showErrorNotification('Error adding User.'));
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [target.name]: value
    });
  }

  render() {
    


return <Modal show={this.state.isShownModal} onHide={this.closeModal} bsSize="large">
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="flexRowContainer pb15">
          <h3 className="pb15">New User</h3>
          <div className="width-maximum">
           <div className="flexColumnContainer mb8">
             <div className="width-100">First Name</div>
             <input className="form-control input-sm mr15 width-200" name="firstName" value={this.state.firstName} type="text" onChange={this.handleInputChange}/>

               <div className="width-100">Last Name</div>
               <input className="form-control input-sm  width-200" name="lastName" value={this.state.lastName} type="text" onChange={this.handleInputChange}/>

           </div>

            <div className="flexColumnContainer">
              <div className="width-120">Email</div>
              <input className="form-control input-sm" name="email" value={this.state.email} type="text" onChange={this.handleInputChange}/>
            </div>
            <div className="flexColumnContainer mb8  pl100">
              <span className="smallLabel">Note: the email address for the user must match the zoom and slack emails used.<br/> If these emails do not match up the user will not be able to login to Qube!</span>
            </div>

            <div className="flexColumnContainer mb8">
              <div className="width-120">Department</div>
              <select value={this.state.departmentId} onChange={(event) => { this.setState({ departmentId: event.target.value });}}>
                <option value={null} key={`no_department`}>None</option>
                {_.map(this.props.departments, (s) =>
                  <option value={s.id} key={s.id}>{s.name}</option>
                )}
              </select>
            </div>


            <div className="flexColumnContainer flexFill flexJustifyEnd pt10">
              <button className="btn btn-danger mr20" onClick={this.closeModal}>Close</button>
              <button className="btn customBtn" onClick={this.doAddUser}>Add User</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>;
  }
}

NewUserModal.defaultProps = {
  userList: [],
  rooms: [],
  floors: [],
  departments: [],
  handleHideModal: PropTypes.func.isRequired
};

export default NewUserModal;
