import client from "./client";

export const getData = (type: string, url: any, request = {}) =>
  client.getInstance(type).get(url, { params: request });
export const postData = (type: string, url: any, data: any, options = {}) =>
  client.getInstance(type).post(url, data, options);
export const errorHelper = (err: any) => {
  const error = err?.response?.data;
  return {
    msg: error?.msg || "Jaringan Bermasalah",
    status: error?.status || 0,
  };
};
export default { getData, postData, errorHelper };
