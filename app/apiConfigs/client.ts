import axios from 'axios';

const generateInstance = (baseURL: string | undefined) => {
  const options = {
    baseURL,
    timeout: 3600 * 60,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  const http = axios.create(options);
  return http;
};

export default class HttpClient {
  public static getInstance(envString: string) {
    switch (envString) {
      case 'api':
        return generateInstance(process.env.VITE_APP_API_URL);
      default:
        return generateInstance('');
    }
  }
}
