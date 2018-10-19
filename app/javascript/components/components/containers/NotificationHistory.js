import React from 'react';
import _ from 'lodash';
import { setTimezone, updatePMI } from '../../utils/api.utils';
import { formatDateTime } from '../../utils/utils';

export class NotificationHistory extends React.Component {
  setTimezone = (event) => {
    const newTimezone = event.target.value;
    setTimezone(newTimezone, this.props.user.id);
  };

  togglePMU = (event) => {
    updatePMI(this.props.user.id, event.target.checked);
  };

  renderGetOutMore = () => {
    if (!_.isEmpty(this.props.notificationHistory)) {
      return '';
    }

    return <span>Time to get out some more! No one has knocked your door or invited you to their room yet.</span>;
  };

  render () {
    const user = this.props.user;
    const timezones = moment.tz.names();
    return (
      <div className="flexRowContainer blackText">
        <span className="pb10 h4">Notification History</span>
        <div className="notification-history">
          {_.map(this.props.notificationHistory, (event)=> {
            return <div className="pb10" key={event.created_at}>
              <span className="smallLabel_noPadding">{formatDateTime(event.created_at, user.timezone)}</span><br/>
              {event.to_s}</div>; })}
          {this.renderGetOutMore()}
        </div>
        <div>
         <hr/>
          <div className="flexColumnContainer">
            <input type="checkbox" checked={_.get(user, 'use_pmi')} onClick={this.togglePMU}/>
              <span className="pl5">Always use Zoom Personal Meeting ID to start meetings.</span>
          </div>
        </div>
        <div>
          <hr/>
          <div className="flexRowContainer">
            <div className="h4">Timezone</div>
            <select className="border width-220" value={_.get(user, 'timezone')} onChange={this.setTimezone}>
              { _.map(timezones, (timezone) => {
                return <option key={timezone} value={timezone}>{timezone}</option>;
              })}
              </select>
          </div>
        </div>
      </div>
  );
  }
}

export default NotificationHistory;
