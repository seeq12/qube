import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/loadActions';
import LoginPage from './LoginPage';
import Layout from './Layout.js';
import NoMobile from '../NoMobile';
import { addCss } from '../../utils/theme.utils';

import { loadApplicationSettings } from '../../utils/api.utils';
import {setAdminOnlyMode, setSelfRegistrationMode} from "../../actions/adminToolActions";


let loadedTheme = undefined;

const isMobile = {
  Android: function() {
    return navigator.userAgent.match(/Android/i);
  },

  BlackBerry: function() {
    return navigator.userAgent.match(/BlackBerry/i);
  },

  iOS: function() {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },

  Opera: function() {
    return navigator.userAgent.match(/Opera Mini/i);
  },

  Windows: function() {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
  },

  any: function() {
    return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
  }
};

export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      settings: null
    };
  }

  render() {
    if (isMobile.any()) {
      return <NoMobile></NoMobile>;
    }
    // this is a bit of a hack. If there's a userId then there has to be a devise user so we're logged in - if not - show the login page
    const currentUserId =  jQuery('#currentUserId').data('userid');
    if (currentUserId && !this.props.currentUserId) {
      this.props.actions.setCurrentUserId(currentUserId);
    }

    // Manage loading of the selected Theme. Themes are only applied once they've been changed.
    if (this.props.currentUserId) {
      const user = _.find(this.props.userList, { id: this.props.currentUserId });
      const userTheme = _.get(user, 'theme');

      if (!_.isEmpty(this.props.themes) && userTheme && loadedTheme !== userTheme) {
        loadedTheme = userTheme;
        addCss(userTheme, this.props.themes);
      }
    }

    return (
      this.props.currentUserId ? <Layout adminOnlyMode={this.props.adminOnlyMode} /> : <LoginPage />
    );
  }

  componentDidUpdate() {
    if (this.props.currentUserId  && _.isNil(this.state.settings)) {
      this.setState({ settings: 'foo'});
      loadApplicationSettings().then((data) => {
        this.props.setAdminOnlyMode(data.data.admin_mode);
        this.props.setSelfRegistrationMode(data.data.self_registration);
        this.setState({ settings: 'foo', 'admin_mode': data.admin_mode });
      });
    }
  }
}

App.propTypes = {
  actions: PropTypes.object.isRequired
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
    setAdminOnlyMode: bindActionCreators(setAdminOnlyMode, dispatch),
    setSelfRegistrationMode: bindActionCreators(setSelfRegistrationMode, dispatch)
  };
}

const mapStateToProps = (...args) => {
  return {
    themes: args[0].themes,
    currentUserId: args[0].currentUserId,
    userList: args[0].userList,
    adminOnlyMode: args[0].adminOnlyMode,
    selfRegistration: args[0].selfRegistration
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
