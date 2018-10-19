import React, { Component } from 'react';
import Interceptors from '../components/utils/interceptors';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { ConnectedRouter} from 'react-router-redux';
import { Provider } from 'react-redux';

import 'jquery/src/jquery';
import 'jquery-ujs/src/rails';
import 'bootstrap/dist/js/bootstrap';
import 'react-notifications/lib/notifications.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'flaticon.scss';
import 'font-awesome/css/font-awesome.min.css';
import 'velocity-animate';
import 'react-table/react-table.css';


import configureStore, { history } from '../components/store/configureStore';
import App from '../components/components/containers/App';

export default class Root extends Component {
  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App/>
        </ConnectedRouter>
      </Provider>
    );
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const store = configureStore();
Interceptors.setupInterceptors(store);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Root history={history} store={store} />,
    document.getElementById('application')
  );
});
