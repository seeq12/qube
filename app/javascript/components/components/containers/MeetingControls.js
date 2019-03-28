import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { startMeeting, endMeeting, cancelMeeting } from '../../utils/api.utils';
import { getRoom, joinMeeting } from '../../utils/utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export class MeetingControls extends React.Component {
  constructor(props) {
    super(props);

    this.doStartMeeting = this.doStartMeeting.bind(this);
    this.doEndMeeting = this.doEndMeeting.bind(this);
    this.doJoinMeeting = this.doJoinMeeting.bind(this);
  }

  doStartMeeting () {
    startMeeting(this.props.currentRoomId);
  }

  doEndMeeting () {
    endMeeting(this.props.currentRoomId);
  }

  doJoinMeeting(meetingId) {
    joinMeeting(meetingId);
  }

  renderStartMeetingButton= () => {
    return <div className="pr15 flexAlignCenter">
     <button id="startMeeting" type="button" onClick={this.doStartMeeting}
              className="btn btn-primary mr10 customBtn">
       start a meeting
     </button>
    </div>;
  };

  renderStartingMeeting= () => {
    return <div className="pr15 flexAlignCenter">
      <i className="fa fa-circle-o-notch fa-spin fa-lg fa-fw"></i> <span>starting meeting ...</span>
    </div>;
  };

  renderJoinMeeting =(joinUrl, meetingId) => {
    return (<div className="btn-group">
      <button id="split-button" type="button" className="btn btn-primary customBtn"
              onClick={()=> this.doJoinMeeting(meetingId)}>
        join meeting
      </button>
      <CopyToClipboard text={joinUrl}>
        <button type="button" className="btn btn-primary mr10 customBtn buttonRight">
          <span className="fa fa-copy"></span>
        </button>
      </CopyToClipboard>
    </div>);
  };

  renderEndMeetingButton= () => {
    return <button id="endMeeting" type="button" onClick={this.doEndMeeting}
                    className="btn btn-primary mr10 customBtn">
      end meeting
    </button>;
  };

  render() {
    const currentRoom = getRoom(this.props.rooms, this.props.currentRoomId);
    const meetingId = _.get(currentRoom, 'meeting_id');
    const joinUrl = 'https://zoom.us/j/' + meetingId;
    const meetingStarting = _.get(currentRoom, 'spinner') === 'start';

    return <div className="flexColumnContainer flexAlignCenter">
      { meetingStarting && this.renderStartingMeeting() }
      { !this.props.meetingInProgress && !meetingId && this.renderStartMeetingButton() }
      { meetingId && this.renderJoinMeeting(joinUrl, meetingId) }
      { meetingId && this.renderEndMeetingButton() }
    </div>;
  }
}

const mapDispatchToProps = () => {
  return {};
};

MeetingControls.propTypes = {
  currentRoomId: PropTypes.number,
  user: PropTypes.object
};

const mapStateToProps = (...args) => {
  return {
    rooms: args[0].rooms
  };
};

export default connect(mapStateToProps,
  mapDispatchToProps)(MeetingControls);
