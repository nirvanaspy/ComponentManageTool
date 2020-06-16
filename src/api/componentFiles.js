import request from '../utils/request'

export function hasMd5(md5) {
  return request({
    url: '/files/hasmd5/',
    method: 'get',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    params: {
      MD5: md5
    }
  })
}

export function mergeFile(data) {
  return request({
    url: '/files/chunks/merge',
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

// 根据id和父节点的id创建文件(父节点的id即文件夹的id,可以为空)
export function uploadFiles(compId, parentId, data) {
  return request({
    url: '/components/' + compId + '/uploadfiles',
    method: 'post',
    headers: {
      'content-type': 'application/json;charset=utf-8',
      'parentNodeId': parentId
    },
    data
  })
}
