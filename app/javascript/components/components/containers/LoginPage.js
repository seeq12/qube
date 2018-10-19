import React from 'react';
import NoZoomModal from '../NoZoomModal';

/**
 * Actual Authentication happens via Slack.
 * Once authenticated the user is available via devise.
 * The application.html.erb file contains a div with the currentUserId.
 * If that field has a valid value we can assume we have a user.
 */
export class LoginPage extends React.Component {
  render() {
    const displayNoZoomWarning = window.location.href.indexOf('zoom') > -1;
    return (
      <div className="height-maximum flexRowContainer flexCenter loginSplash">
        <div className="flexRowContainer flexCenter">
          <div className="loginQube mb25"/>
          <div className="mb60">
        <a href="/users/auth/slack">
          <img src="https://platform.slack-edge.com/img/sign_in_with_slack.png" />
        </a>
          </div>
          { displayNoZoomWarning && <NoZoomModal/>}
      </div>
      </div>
    );
  }
}

export default LoginPage;
