import request from '../utils/request'

/**
 * @author chengzhou
 * @export doDeploy
 * @param {string} deployPlanId
 * @param {string} id
 * @param {string} data
 * @returns promise
 */
export function doDeploy(deployPlanId, id, data) {
  return request({
    url: `deploymentdesigns/${deployPlanId}/device/${id}/deploy`,
    method: 'put',
    data
  })
}

/**
 * @author chengzhou
 * @export getDeployDevice
 * @param {deployPlanId}
 * @param {listQuery}
 * @returns promise
 */
export function getDeployDevice(deployPlanId, listQuery) {
  return request({
    url: `deploymentdesigns/${deployPlanId}/devices`,
    method: 'get',
    params: {
      size: listQuery.size,
      page: listQuery.page
    }
  })
}
/**
 * @author chengzhou
 * @export deployNode
 * @param {id}
 * @returns promise
 */
export function deployNode(id) {
  return request({
    url: `deploymentdesignnodes/${id}/deploy`,
    method: 'put'
  })
}
/**
 * @author chengzhou
 * @export deployAll
 * @param {id}
 * @returns promise
 */
export function deployAll(id) {
  return request({
    url: `deploymentdesigns/${id}/deploy`,
    method: 'put'
  })
}

/**
 * @author chengzhou
 * @export deployByDeploymentDesignDetailId
 * @param {id}
 * @returns promise
 */
export function deployByDeploymentDesignDetailId(id) {
  return request({
    url: `deploymentdesigndetails/${id}/deploy`,
    method: 'put'
  })
}

