import request from '../utils/request'
/**
 * @function 查询部署设计节点
 * @author chengzhou
 * @export deployNodeList
 * @param {id}
 * @param {listQuery}
 * @returns promise
 */
export function deployNodeList(id, listQuery) {
  return request({
    url: `deploymentdesigns/${id}/deploymentdesignnodes`,
    method: 'get',
    params: {
      size: listQuery.size,
      page: listQuery.page
    }
  })
}

/**
 * @function 查询部署设计下所有已绑定设备
 * @author chengzhou
 * @export getAllBindDevices
 * @param {string} id
 * @returns promise
 */
export function getAllBindDevices(id) {
  return request({
    url: `deploymentdesigns/${id}/devices`,
    method: 'get'
  })
}

/**
 * @function 新建节点
 * @author chengzhou
 * @export createDeployplanNode
 * @param {string} id
 * @returns promise
 */
export function createDeployplanNode(id) {
  return request({
    url: 'deploymentdesigns/' + id + '/deploymentdesignnode',
    method: 'post'
  })
}

/**
 * @author chengzhou
 * @function 删除节点
 * @export deleteDeployplanNode
 * @param {string} id
 * @returns promise
 */
export function deleteDeployplanNode(id) {
  return request({
    url: 'deploymentdesignnodes/' + id,
    method: 'delete'
  })
}

/**
 * @author chengzhou
 * @function 绑定设备到节点(一个设备绑定多个组件)
 * @export bindDeviceToNode
 * @param {string} nodeId
 * @param {string} deviceId
 * @returns promise
 */
export function bindDeviceToNode(nodeId, deviceId) {
  return request({
    url: `deploymentdesignnodes/${nodeId}/device/${deviceId}/bind`,
    method: 'post'
  })
}

/**
 * @function 以组件为视角,(一个组件) 绑定多个设备
 * @export componentBindingDevice
 * @author chengzhou
 * @param {string} deploymentDesignNodeId 一个组件的id
 * @param {string} deviceId  多个设备的id: deviceId
 * @returns promise
 */
export function componentBindingDevice(deploymentDesignNodeId, deviceId) {
  return request({
    url: `deploymentdesignnodes/${deploymentDesignNodeId}/device/bind`,
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data: deviceId
  })
}

/**
 *  @function    单独解绑设备
 *  @export      aloneUnboundEquipment
 *  @author      xiaoyangyang
 *  @param       {string} deploymentDesignNodeId   节点的id
 *  @param       {string} deviceId   解绑设备的id
 *  @returns     promise
 */
//  deploymentdesignnodes/{deploymentDesignNodeId}/{deviceId}/unbind
export function aloneUnboundEquipment(deploymentDesignNodeId, deviceId) {
  return request({
    url: `deploymentdesignnodes/${deploymentDesignNodeId}/${deviceId}/unbind`,
    method: 'delete'
  })
}

/**
 * @author chengzhou
 * @function 解绑设备
 * @export unbindDeviceByNode
 * @param {string} nodeId
 * @returns promise
 */
export function unbindDeviceByNode(nodeId) {
  return request({
    url: `deploymentdesignnodes/${nodeId}/unbind`,
    method: 'delete'
  })
}
/**
 * @author chengzhou
 * @function 查询部署节点绑定详情
 * @export getNodeDetail
 * @param {id}
 * @returns promise
 */
export function getNodeDetail(id) {
  return request({
    url: `deploymentdesignnodes/${id}/deploymentdesigndetails`,
    method: 'get'
  })
}

/**
 * @function  绑定组件到部署设计节点(单个绑定）
 * @author chengzhou
 * @export bindCompToNode
 * @param {string} nodeId
 * @param {string} data
 * @returns promise
 */
export function bindCompToNode(nodeId, data) {
  return request({
    url: `deploymentdesignnodes/${nodeId}/deploymentdesigndetailbycomponent`,
    method: 'post',
    data
  })
}

/**
 * @function 根据当前设备id单个解绑
 * @author chengzhou
 * @export singeUnbundling
 * @param {string} deploymentDesignNodeId 当前节点ID
 * @param {string} deviceId 当前设备id
 * @returns promise
 */
export function singeUnbundling(deploymentDesignNodeId, deviceId) {
  return request({
    url: `deploymentdesignnodes/${deploymentDesignNodeId}/${deviceId}/unbind`,
    method: 'delete'
  })
}

/**
 * @author chengzhou
 * @export bindCompsToNode
 * @function 绑定组件到部署设计节点(多个绑定）
 * @param {string} nodeId
 * @param {string} data
 * @returns promise
 */
export function bindCompsToNode(nodeId, data) {
  return request({
    url:
      'deploymentdesignnodes/' + nodeId + '/deploymentdesigndetailbycomponents',
    method: 'post',
    data
  })
}

/**
 * @function 绑定组件历史版本到部署设计节点(多个绑定）
 * @author chengzhou
 * @export bindCompHisToNode
 * @param {string} nodeId
 * @returns promise
 */
export function bindCompHisToNode(nodeId, data) {
  return request({
    url: `deploymentdesignnodes/${nodeId}/deploymentdesigndetailbycomponenthistorys`,
    method: 'post',
    data
  })
}

/**
 * @function 删除部署节点详情（解绑组件）
 * @author chengzhou
 * @export deleteBindDetail
 * @param {string} id
 * @returns promise
 */
export function deleteBindDetail(id) {
  return request({
    url: 'deploymentdesigndetails/' + id,
    method: 'delete'
  })
}

/**
 * @function 删除部署节点详情（解绑组件）
 * @author chengzhou
 * @export deleteDeployplan
 * @param {string} id
 * @returns promise
 */
export function deleteDeployplan(id) {
  return request({
    url: `deploymentdesigns/${id}`,
    method: 'delete'
  })
}

/**
 * @author chengzhou
 * @export deployplanDetailsList
 * @param {string} deploymentDesignId
 * @returns promise
 */
export function deployplanDetailsList(deploymentDesignId) {
  return request({
    url: `/deploymentdesigns/${deploymentDesignId}/deploymentdesigndetails`,
    method: 'get'
  })
}

/**
 * @author chengzhou
 * @export deployplanDevice
 * @param {string} deploymentDesignId
 * @returns promise
 */
export function deployplanDevice(deploymentDesignId) {
  return request({
    url: `/deploymentdesigns/${deploymentDesignId}/devices`,
    method: 'get'
  })
}

/**
 * @author chengzhou
 * @export getDeployDetailByDevice
 * @param {string} deploymentDesignId
 * @param {string} deviceid
 * @returns promise
 */
export function getDeployDetailByDevice(deploymentDesignId, deviceid) {
  return request({
    url: `/deploymentdesigns/${deploymentDesignId}/deploymentdesigndetail`,
    method: 'get',
    params: {
      deviceId: deviceid
    }
  })
}

/**
 * @author chengzhou
 * @function 获取可绑定组件
 * @export getAvailableComps
 * @param {string} nodeId
 * @returns promise
 */
export function getAvailableComps(nodeId) {
  return request({
    url: `/deploymentdesignnodes/${nodeId}/components`,
    method: 'get'
  })
}

/**
 * @author chengzhou
 * @function 绑定组件历史到节点
 * @export bindSingleCompHisToNode
 * @param {string} nodeId
 * @param {string} compHisId
 * @returns promise
 */
export function bindSingleCompHisToNode(nodeId, compHisId) {
  return request({
    url: `deploymentdesignnodes/${nodeId}/componenthistory/${compHisId}/bind`,
    method: 'post'
  })
}

/**
 * @author chengzhou
 * @function 更新已绑定组件历史版本
 * @export  updateCompHisToNode
 * @param {string} detailId
 * @param {string} compHisId
 * @returns promise
 */
export function updateCompHisToNode(detailId, compHisId) {
  return request({
    url: `deploymentdesigndetails/${detailId}/componenthistory/${compHisId}/bind`,
    method: 'patch'
  })
}

/**
 * @functin 保持版本为最新
 * @author chengzhou
 * @export keepLatest
 * @param {detailId}
 * @param {flag}
 * @returns promise
 */
export function keepLatest(detailId, flag) {
  return request({
    url: `deploymentdesigndetails/${detailId}/keep-latest`,
    method: 'patch',
    params: {
      keepLatest: flag
    }
  })
}
