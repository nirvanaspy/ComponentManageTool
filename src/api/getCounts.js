import request from '@/utils/request'

// 根据项目id查询组件数量
export function getCompCounts(id) {
  return request({
    url: '/projects/' + id + '/componentcounts',
    method: 'get',
    params: {
      deleted: false
    }
  })
}

// 根据项目id查询部署数量
export function getDeviceCounts(id) {
  return request({
    url: '/projects/' + id + '/devicecounts',
    method: 'get',
    params: {
      deleted: false
    }
  })
}

//  根据项目id查询部署设计数量
export function getDeployDesignCounts(id) {
  return request({
    url: '/projects/' + id + '/deploymentdesigncounts',
    method: 'get',
    params: {
      deleted: false,
      baseline: false
    }
  })
}
