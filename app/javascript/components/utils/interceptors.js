import axios from 'axios';
import { showErrorNotification } from './notifications';
export default {
  setupInterceptors: () => {
    // Add a response interceptor
    axios.interceptors.response.use((response) => {
      return response;
    }, (error) => {
      if (_.get(error, 'response.status') === 404) {
        window.location.reload();
      } else {
        showErrorNotification(_.get(error, 'response.data.errors', 'Something went wrong.'));
      }

      return Promise.reject(error);
    });
  }
};
