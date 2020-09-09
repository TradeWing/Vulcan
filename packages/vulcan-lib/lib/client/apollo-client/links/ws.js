import { WebSocketLink } from 'apollo-link-ws';
import Cookies from 'universal-cookie';
const SUB_ENDPOINT = 'ws://localhost:5005/subscriptions';

const cookie = new Cookies();

const wsLink2 = new WebSocketLink({
  uri: SUB_ENDPOINT,
  options: {
    timeout: 30000,
    reconnect: true,
    connectionParams: () => {
      return {
        meteorLoginToken: cookie.get('meteor_login_token'),
      };
    },
  },
});

export default wsLink2;
