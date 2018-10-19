import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/loadActions';
import { getInitialZoomLevel } from '../../utils/utils';

export class ZoomControls extends React.Component {
  constructor(props) {
    super(props);
    this.resetZoom = this.resetZoom.bind(this);
    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
  }

  resetZoom() {
    const floorplanSizing = getInitialZoomLevel(this.props.floorPlanTransforms.width, this.props.floorPlanTransforms.height);
    this.props.actions.setFloorplanTransforms({ scale: floorplanSizing.scale, x: floorplanSizing.x, y: floorplanSizing.y });
  }

  zoomIn() {
    // determine the current zoom level and then adjust:
    this.props.actions.setFloorplanTransforms({ scale: this.props.floorPlanTransforms.scale * 0.9 });
  }

  zoomOut() {
    this.props.actions.setFloorplanTransforms({ scale: this.props.floorPlanTransforms.scale * 1.1 });
  }

  render() {

    return <div>
      <i className="fa fa-search-plus fa-2x cursorPointer iconLarge" aria-hidden="true" onClick={this.zoomOut}></i>
      <i className="fa fa-search-minus fa-2x cursorPointer iconLarge" aria-hidden="true" onClick={this.zoomIn}></i>
      <i className="fa fa-arrows fa-2x cursorPointer iconLarge" aria-hidden="true" onClick={this.resetZoom}></i>
    </div>;
  }

  componentDidMount = () => {
    window.addEventListener('resize', _.debounce(this.resetZoom, 300));
  };
}

ZoomControls.defaultProps = {
  floorPlanTransforms: {}
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
};

const mapStateToProps = (...args) => {

  return {
    floorPlanTransforms: args[0].floorPlanTransforms
  };
};

export default connect(mapStateToProps,
  mapDispatchToProps)(ZoomControls);
