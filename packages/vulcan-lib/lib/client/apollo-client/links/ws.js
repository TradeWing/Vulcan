import { WebSocketLink } from 'apollo-link-ws';
import Cookies from 'universal-cookie';

const cookie = new Cookies();

const wsLink2 = new WebSocketLink({
  uri: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${
    location.host
  }/subscriptions`,
  options: {
    minTimeout: 5000,
    timeout: 60000,
    reconnect: true,
    connectionParams: () => {
      return {
        meteorLoginToken: cookie.get('meteor_login_token'),
      };
    },
    connectionCallback: error => {
      if (!error) {
        console.log('websocket link connection callback succeeded');
      } else {
        console.error('websocket link connection callback error: ', error);
      }
    },
  },
});

export default wsLink2;
