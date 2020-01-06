import axios from 'axios'

export default function fetch(url, options){
  return axios({
    ...options,
    url,
  })
}
