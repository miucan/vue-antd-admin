import { getCategorys } from '@/api/news.js'
const actions ={
  getAllCategory(context,payload){
    return new Promise((resolve,reject)=>{
        getCategorys()
        .then((res)=>{
          resolve(res)
        })
        .catch((err)=>{
          reject(err)
        })
    })
  }
}

export default {
  namespaced: true,
  actions
}