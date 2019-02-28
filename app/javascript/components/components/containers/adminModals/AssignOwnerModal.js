import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactTable from 'react-table';
import { assignRoomToUser } from '../../../utils/api.utils';
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifications';

export class AssignOwnerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true
    };
  }

  closeModal = () => {
    this.setState({ isShownModal: false });
    this.props.handleHideModal();
  };

  assignOwner(userId) {
    return assignRoomToUser(this.props.roomId, userId)
      .then(()=> {
      showSuccessNotification('User assigned'); this.closeModal();
    })
      .catch(() => showErrorNotification('Error assigning User.'));
  }

  render() {
    const columns = [{ accessor: 'first_name', Header: 'First name' }, { accessor: 'last_name', Header: 'Last name' },
      { 'accessor': 'email', Header: 'Email' },
      { Header: '', accessor: 'id', filterable: false, width: 200,
        Cell: row =>  <div className="text-center"><button onClick={()=> this.assignOwner(row.value)} className="btn btn-primary customBtn mr10">Assign Owner</button></div> }];
    return <Modal show={this.state.isShownModal} onHide={this.closeModal} bsSize="large">
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="flexRowContainer pb15 scroll pl10 pr10">
          <h3 className="pb15">Assign a user</h3>
          <div className="width-maximum">
            <ReactTable
              data={this.props.userList}
              columns={columns}
              width={900}
              filterable
              defaultPageSize={10}
              defaultFilterMethod={(filter, row) =>
                _.includes(_.toLower(String(row[filter.id])), _.toLower(filter.value))}
              className="-striped -highlight"/>
            <div className="flexColumnContainer flexFill flexJustifyEnd pt10">
              <button className="btn btn-danger" onClick={this.closeModal}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>;
  }
}

AssignOwnerModal.defaultProps = {
  userList: [],
  handleHideModal: PropTypes.func.isRequired
};

export default AssignOwnerModal;
