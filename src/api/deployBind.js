import request from '../utils/request'

/**
 * @author chengzhou
 * @export doDeployBind
 * @param {string} deployPlanId
 * @param {string} data
 * @return promise
 */
export function doDeployBind(deployPlanId, data) {
  return request({
    url: `deploymentdesigns/${deployPlanId}/deploymentdesigndetail`,
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data
  })
}

/**
 * @author chengzhou
 * @export getDeployComLists
 * @param {deployPlanId}
 * @param {deviceId}
 * @returns promise
 */
export function getDeployComLists(deployPlanId, deviceId) {
  return request({
    url: `deploymentdesigns/${deployPlanId}/deploymentdesigndetail`,
    method: 'get',
    params: {
      'deviceId': deviceId
    },
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })
}

/**
 * @author chengzhou
 * @export deleteBind
 * @param {string} id
 * @returns promise
 */
export function deleteBind(id) {
  return request({
    url: `/deploymentdesigndetails/${id}`,
    method: 'delete'
  })
}

