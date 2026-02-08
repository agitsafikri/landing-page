import axios from "axios";

const generateInstance = (baseURL: string | undefined) => {
  const options = {
    baseURL,
    timeout: 3600 * 60,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  const http = axios.create(options);
  return http;
};

export default class HttpClient {
  public static getInstance(envString: string) {
    const config = useRuntimeConfig();
    switch (envString) {
      case "api_url":
        return generateInstance(config.public.api_url);
      default:
        return generateInstance("");
    }
  }
}
