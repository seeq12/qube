import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/loadActions';
import { updateStatus, updateState, updateBackBy, setUserAvailable, setUserSocial } from '../../utils/api.utils';
import { formatTime } from '../../utils/utils';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { STATES } from '../../constants/appConstants';
import { showErrorNotification } from '../../utils/notifications';
import EditableInput from '../../utils/EditableInput';

const fallbackStatus = 'What are you up to?';
export class StatusControls extends React.Component {
  constructor(props) {
    super(props);

    this.STATES = STATES;
    this.state = {
      newUserState: null
    };

    this.setStatus = this.setStatus.bind(this);
    this.setUserState = this.setUserState.bind(this);
    this.renderBackBySection = this.renderBackBySection.bind(this);
    this.setBBTime = this.setBBTime.bind(this);
    this.getSuggestedBBTime = this.getSuggestedBBTime.bind(this);
    this.validateBBTime = this.validateBBTime.bind(this);
    this.notEmpty = this.notEmpty.bind(this);
  }

  notEmpty(input) {
    return input.trim() !== '';
  }

  setBBTime(backByTime) {
    return updateBackBy(this.validateBBTime(backByTime), this.props.currentUser.id);
  }

  setStatus(status) {
    if (_.trim(status) !== fallbackStatus) {
      return updateStatus(status, this.props.currentUser.id);
    }

    return Promise.resolve();
  }

  getStatusDisplay() {
    return _.trim(this.props.currentUser.status) === '' ? fallbackStatus : this.props.currentUser.status;
  }

  setUserState(event) {
    const newUserState = event.target.value;
    this.setState({ newUserState });
    if (newUserState === STATES.AVAILABLE) {
      setUserAvailable(this.props.currentUser.id);
    } else if (newUserState === STATES.SOCIAL) {
      setUserSocial(this.props.currentUser.id);
    } else {
      updateState(newUserState, this.props.currentUser.id);
    }
  }

  getSuggestedBBTime() {
    const user = this.props.currentUser;
    let backBy;
    const currentState = this.state.newUserState ? this.state.newUserState : user.state;
    if (currentState === this.STATES.RIGHT_BACK) {
      backBy = roundTime(moment().add(15, 'm'));

    } else if (currentState === STATES.AWAY) {
      backBy = roundTime(moment(new Date()).utc().add(1, 'h'), user.timezone);
    }

    if (!backBy) {
      backBy = 'hh:mm';
    } else {
      this.setBBTime(backBy);
    }

    return backBy;
  }

  validateBBTime(time) {
    const now = moment().tz(this.props.currentUser.timezone);
    let minutes, hours, isAM;
    time = _.toLower(time);
    time = _.trim(time);

    let regex = /\b((1[0-2]|0?[1-9]):([0-5][0-9])\s?([AaPp][Mm]))/;
    // 12:00AM, 3:00 PM case
    if (regex.test(time)) {
      return moment(time, ['hh:mm a']).utc().format();
    }

    // military time:
    regex = /^([0-1]?[0-9]|2[0-3])(:?[0-5][0-9])?$/;
    if (regex.test(time)) {
      time = _.replace(time, ':', '');
      hours = time.substring(0, 2);
      minutes = time.substring(2);
      now.set('hour', hours);
      now.set('minute', minutes);
      return moment.utc(now).format();
    }

    // something like 5pm
    regex = /^([1-9]|1[012])\s?([AaPp][Mm])/;
    if (regex.test(time)) {
      isAM = time.indexOf('am') > -1;
      hours = parseInt(_.replace(time, isAM ? 'am' : 'pm', ''));
      if (!isAM) {
        hours += 12;
      }

      now.set('hour', hours);
      now.set('minute', 0);
      return moment.utc(now).format();
    }

    if (_.get(this.props.currentUser, 'state') !== STATES.BUSY) {
      showErrorNotification('We tried :(<br>Qube will parse the following time formats: 4PM, 12:00 AM, 12:00AM, and military time (14:00 or 1400)');
    }

    return null;
  }

  renderBackBySection() {
    return <div className="ml10 flexColumnContainer">
      <span className="mr10">back by</span>

      <EditableInput display={this.props.currentUser.back_by ? formatTime(this.props.currentUser.back_by, this.props.currentUser.timezone) : this.getSuggestedBBTime()} editingStyle="blackText width-75"
                     changeAction={this.setBBTime} editing={false}
                     tabIndex={12}/>
      </div>;
  }

  render() {
    return <div className="flexColumnContainer flexAlignCenter">
      <select className="mr20 ml10" value={this.props.currentUser.state} onChange={this.setUserState}>
        {_.map(STATES, (s) =>
          <option value={s} key={s}>{s}</option>
        )}
      </select>

      <EditableInput display={this.getStatusDisplay()} editingStyle="blackText" changeAction={this.setStatus} editing={false} tabIndex={11}/>
      {_.indexOf([STATES.AWAY, STATES.RIGHT_BACK, STATES.BUSY], this.props.currentUser.state) > -1 && this.renderBackBySection()}
    </div>;
  }
}

StatusControls.propTypes = {
  currentUser: PropTypes.object
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
};

const mapStateToProps = (...args) => {
  return {};
};

const roundTime = (time)=> {
  const ROUNDING = 15 * 60 * 1000;
  /*ms*/
  time = moment(Math.ceil((+time) / ROUNDING) * ROUNDING);
  return time.format('h:mm a');
};

export default connect(mapStateToProps,
  mapDispatchToProps)(StatusControls);
