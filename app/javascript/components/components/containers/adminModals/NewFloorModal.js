import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { addFloor } from '../../../utils/api.utils';
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifications';
import { FLOOR_SIZES } from '../../../constants/appConstants';

export class NewFloorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true,
      name: '',
      size: 10
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.doAddFloor = this.doAddFloor.bind(this);
  }

  closeModal = () => {
    this.setState({ isShownModal: false,
      name: '' });
    this.props.handleHideModal();
  };

  doAddFloor() {
    return addFloor(this.state.name, this.state.size, _.size(this.props.floors)+1)
       .then(()=> {
      showSuccessNotification('Floor added'); this.closeModal();
    })
       .catch(() => showErrorNotification('Error adding Floor.'));
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
          <h3 className="pb15">New Floor</h3>

            <div className="flexColumnContainer mb8">
              <div className="width-100">Name</div>
              <input className="form-control input-sm mr15 width-200" name="name" value={this.state.name} type="text" onChange={this.handleInputChange}/>
            </div>
          <div className="flexColumnContainer mb8">
            <div className="width-100"># of Rooms</div>
            <select value={this.state.size} onChange={(event) => { this.setState({ size: event.target.value });}}>

              {_.map(FLOOR_SIZES, (s) =>
                <option value={s} key={`floor_size${s}`}>{s}</option>
              )}
            </select>
          </div>
            <div className="flexColumnContainer flexFill flexJustifyEnd pt10">
              <button className="btn btn-danger mr20" onClick={this.closeModal}>Close</button>
              <button className="btn customBtn" onClick={this.doAddFloor}>Add Floor</button>
            </div>
        </div>
      </div>
    </Modal>;
  }
}

NewFloorModal.defaultProps = {
  floors:[],
  handleHideModal: PropTypes.func.isRequired
};

export default NewFloorModal;
