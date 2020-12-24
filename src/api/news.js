import request from '@/utils/request'

// 添加一级标题
export function addStartersCategory(data) {
  return request({
    url: '/news/addFirstCategory/',
    method: 'post',
    data
  })
}


// 获取所有分类
export function getCategorys() {
  return request({
    url: '/news/getCategoryAll/'
  })
}

// 删除一级分类
export function deleteCategory(data) {
  return request({
    url: '/news/deleteCategory/',
    data
  })
}


//编辑一级分类
export function editFirstCategorys(data) {
  return request({
    url: '/news/editCategory/',
    data
  })
}

// 添加子级分类
export function addChildrenCategory(data) {
  return request({
    url: '/news/addChildrenCategory/',
    data
  })
}

export function getServiceList(data){
  return request({
    url:'/news/getList/',
    data
  })
}


export function addServiceInfo(data){
  return request({
    url:'/news/add/',
    data
  })
}