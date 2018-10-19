import React from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import _ from 'lodash';
import { addFloor, reorderFloors } from '../../../utils/api.utils';
import { showErrorNotification, showSuccessNotification } from '../../../utils/notifications';

const SortableItem = SortableElement(({ value }) =>
  <li className="SortableItem">{value.name}</li>

);

const SortableList = SortableContainer(({ items }) => {
  return (
    <ul className="SortableList">
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} class="SortableItem"/>
      ))}
    </ul>
  );
});

export class OrderFloorModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShownModal: true,
      name: '',
      size: 10,
      floors: this.props.floors
    };

  }

  closeModal = () => {
    this.setState({ isShownModal: false,
      name: '' });
    this.props.handleHideModal();
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      floors: arrayMove(this.state.floors, oldIndex, newIndex)
    });
  };

  applyNewOrder() {
    reorderFloors(_.map(this.state.floors, 'id'))  .then(()=> {
      showSuccessNotification('Floors reordered'); this.closeModal();
    })
      .catch(() => showErrorNotification('Error reordering Floor.'));
  }

  render() {

    return <Modal show={this.state.isShownModal} onHide={this.closeModal}>
      <div className="flexRowContainer flexAlignCenter pt25 pb15 flexCenter">
        <div onClick={this.closeModal}><i className="fa fa-close modalCloseBtn"></i></div>
        <div className="flexRowContainer pb15">
          <h3 className="pb15">Order Floors</h3>
          <span className="small">Drag and Drop Floors in the desired order</span>
          <div className="flexColumnContainer">
            <ul className="SortableList width-100">
              {_.map(this.props.floors, (f, idx) => <li className="SortableItem width-100">Level {idx + 1}</li>
            )}
            </ul>
           <SortableList items={this.state.floors} onSortEnd={this.onSortEnd} />
          </div>
            <div className="flexColumnContainer flexFill flexJustifyEnd pt10">
              <button className="btn btn-danger mr20" onClick={this.closeModal}>Close</button>
              <button className="btn customBtn" onClick={this.applyNewOrder.bind(this)}>Apply new order</button>
            </div>
        </div>
      </div>
    </Modal>;
  }
}

OrderFloorModal.defaultProps = {
  floors: [],
  handleHideModal: PropTypes.func.isRequired
};

export default OrderFloorModal;
