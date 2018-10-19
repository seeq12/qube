import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactTable from 'react-table';
import {assignRoomToUser} from "../../../utils/api.utils";
import {showErrorNotification, showSuccessNotification} from "../../../utils/notifications";

export class AssignHomeModal extends React.Component {
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

  assignHome(roomId) {
    return assignRoomToUser(roomId, this.props.userId)
      .then(()=> {
      showSuccessNotification('Owner assigned'); this.closeModal();
    })
      .catch(() => showErrorNotification('Error adding Owner.'));
  }

  render() {
    const columns = [{ Header: 'Name', accessor: 'name', width: 200 },
      { Header: 'Floor', accessor: 'floor_id', Cell: row => (_.get(_.find(this.props.floors, { id: row.value }), 'name')), width: 300,
        filterMethod: (filter, row) => {
          if (filter.value === 'all') {
            return true;
          }
          return _.toNumber(row[filter.id]) === _.toNumber(filter.value);
        },

        Filter: ({ filter, onChange }) =>
          <select
            onChange={event => onChange(event.target.value)}
            style={{ width: '100%' }}
            value={filter ? filter.value : 'all'}
          >
            <option value="all">Show All</option>
            {_.map(this.props.floors, (floor) =>  <option value={floor.id} key={`floor_id${floor.id}`}>{floor.name}</option>)}
          </select> },
      { Header: '', accessor: 'id', filterable: false, width: 200,
        Cell: row =>  <div className="text-center"><button onClick={()=> this.assignHome(row.value)} className="btn btn-primary customBtn mr10">Assign Home</button></div> }];
    return <Modal show={this.state.isShownModal} onHide={this.closeModal} bsSize="large">
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="flexRowContainer pb15">
          <h3 className="pb15">Assign a home</h3>
          <div className="width-maximum">
            <ReactTable
              data={_.filter(this.props.rooms, { owner_id: null, room_type: 'office' })}
              columns={columns}
              width={900}
              filterable
              defaultPageSize={10}
              defaultFilterMethod={(filter, row) =>
                _.includes(String(row[filter.id]), filter.value)}
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

AssignHomeModal.defaultProps = {
  userList: [],
  rooms: [],
  floors: [],
  userId: PropTypes.node,
  currentHomeId: PropTypes.node,
  handleHideModal: PropTypes.func.isRequired
};

export default AssignHomeModal;
