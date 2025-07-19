import client from './client'

const getData = (type: string, url: any, request = {}) => client.getInstance(type).get(url, { params: request })
const errorHelper = (err: any) => {
  const error = err?.response?.data
  return {
    msg: error?.msg || 'Jaringan Bermasalah',
    status: error?.status || 0,
  }
}
export default {getData, errorHelper}