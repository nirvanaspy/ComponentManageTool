import request from "../utils/request"

export function compList(proId, listQuery) {
  return request({
    url: "/projects/" + proId + "/components",
    method: "get",
    params: {
      // isShowHistory: false,
      deleted: false,
      size: listQuery.limit,
      page: listQuery.page
    }
  })
}

/**
 * @author chengzhou
 * @export compAll
 * @param {proId}
 * @returns
 */
export function compAll(proId) {
  return request({
    url: `/projects/${proId}component`,
    method: "get",
    params: {
      deleted: false
    }
  })
}
// 已删除组件
export function compListHistory(proId, listQuery) {
  return request({
    url: "/projects/" + proId + "/components",
    method: "get",
    params: {
      deleted: true,
      size: listQuery.limit,
      page: listQuery.page
    }
  })
}
// 组件历史版本 -- 分页
export function compHisVersion(id, listQuery) {
  return request({
    url: "/components/" + id + "/history",
    method: "get",
    params: {
      size: listQuery.limit,
      page: listQuery.page
    }
  })
}
/**
 * @author chengzhou
 * @function
 * @export compHisVersions
 * @param {id}
 * @returns promise
 */
export function compHisVersions(id) {
  return request({
    url: `/components/${id}/historys`,
    method: "get"
  })
}

// 创建组件接口
export function createComp(proId, data) {
  return request({
    url: "/projects/" + proId + "/component",
    method: "post",
    headers: {
      "content-type": "application/json"
    },
    data
  })
}

export function updateComp(data, id) {
  return request({
    url: "/components/" + id,
    method: "PATCH",
    data
  })
}

export function copyComp(data, id) {
  return request({
    url: "/components/" + id + "/copy",
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    data
  })
}

export function importComp(userData, data) {
  return request({
    url: "/components/import",
    method: "post",
    auth: {
      username: userData.username,
      password: userData.password
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    data
  })
}

export function deleteComp(id) {
  return request({
    url: "/components/" + id,
    method: "delete"
  })
}

export function compSingle(id) {
  return request({
    url: "/components/" + id,
    method: "get",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    }
  })
}

// 组件分类

// 获取组件分类
export function getCompTypes(id) {
  return request({
    url: "/projects/" + id + "/componenttypes",
    method: "get"
  })
}

// 新建组件分类
export function saveCompTypes(id, data) {
  return request({
    url: "/projects/" + id + "/componenttypes",
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    data
  })
}

// 删除组件分类
export function deleteCompType(id) {
  return request({
    url: "/componenttypes/" + id,
    method: "delete"
  })
}

// 修改组件分类
export function updateCompTypes(data, id) {
  return request({
    url: "/componenttypes/" + id,
    method: "PATCH",
    data
  })
}

// getComById
export function getCompById(id) {
  return request({
    url: "/components/" + id,
    method: "get"
  })
}

// 组件管理
// savefiles
export function saveFiles(id, data) {
  return request({
    // url: '/components/' + id + '/componentfiles/savefile',
    url: `/components/${id}/componentfiles/savefile`,
    method: "post",
    headers: {
      // 'content-type': 'application/x-www-form-urlencoded'
      "content-type": "application/json"
    },
    data
  })
}
// saveFolder 新建文件夹
export function saveFolder(id, parentNodeId, data) {
  return request({
    url: "/components/" + id + "/createfolder",
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      parentNodeId: parentNodeId
    },
    data
  })
}

// getfiles  // 根据id和父节点查询组件文件或者文件夹(父节点可以为空)
export function getCompFiles(id, parent) {
  return request({
    url: "/components/" + id + "/files",
    method: "get",
    headers: {
      parentNodeId: parent
    }
  })
}
// deletefiles
export function deleteCompFiles(id) {
  return request({
    url: "/componentfiles/" + id,
    method: "delete"
  })
}
// exportfiles
export function exportCompFiles(id) {
  return request({
    url: "/componentfiles/" + id + "/export",
    method: "get"
  })
}
// uploadFolder
export function uploadFolder(id, data) {
  return request({
    url: "/components/" + id + "/componentfiles/uploadfolder",
    method: "post",
    data
  })
}
// moveFileTo
export function movefileTo(FileId, targetId, data) {
  return request({
    url: "/componentfiles/" + FileId + "/move",
    method: "patch",
    data
  })
}
// copyFileTo
export function copyFileTo(FileId, targetId, data) {
  return request({
    url: "/componentfiles/" + FileId + "/copy",
    method: "patch",
    data
  })
}
// renameFile
export function renameFile(FileId, data) {
  return request({
    url: "/componentfiles/" + FileId,
    method: "patch",
    data
  })
}

// 回收站
// 恢复已删除组件
export function restoreCom(comId) {
  return request({
    url: "/components/" + comId + "/restore",
    method: "patch"
  })
}

// 清除已删除组件
export function cleanCom(comId) {
  return request({
    url: "/components/" + comId + "/clean",
    method: "delete"
  })
}

// 获取历史组件文件
export function getHisCompFiles(id, parent) {
  return request({
    url: "/componenthistorys/" + id + "/files",
    method: "get",
    headers: {
      parentNodeId: parent
    }
  })
}

/**
 * @function 模糊查询搜索
 * @author chengzhou
 * @export getComponentFuzzQueryById
 * @url /components/{userId}/fuzzyQuery
 * @param {userId,componentName, version, description, page, size}
 * @returns promise对象 响应数据对象
 */
export function getComponentFuzzQueryById(
  componentName,
  version,
  description,
  category,
  page,
  size,
  userId,
  deleted
) {
  return request({
    url: `/components/${userId}/fuzzyQuery/`,
    method: "get",
    params: {
      componentName,
      version,
      description,
      category,
      page,
      size,
      deleted
    }
  })
}

// admin 登录搜索接口
export function getComponentFuzzQueryById_admin(
  componentName,
  version,
  description,
  category,
  page,
  size
) {
  return request({
    url: `/components/fuzzyQuery/`,
    method: "get",
    params: {
      componentName,
      version,
      description,
      category,
      page,
      size
    }
  })
}

/**
 * @function 导出组件文件
 * @author chengzhou
 * @export exportCompomentFileByComponent
 * @param {componentId}
 * @returns promise对象
 */
export function exportCompomentFileByComponent(componentId) {
  return request({
    url: `/components/${componentId}/export`,
    method: "get"
  })
}

/**
 * @function 创建表单 点击确定按钮，保存接口  : 自定义表单
 * @auther chengzhou
 * @export saveCustomText
 * @param {data}
 * @returns promise对象
 */

// 新版本-自定义参数
export function saveCustomText(data) {
  return request({
    url: "/projects/customTextBoxts",
    method: "post",
    headers: {
      "content-type": "application/json"
    },
    data
  })
}

// ---旧版本-自定义参数
// export function saveCustomText(data) {
//   return request({
//     url: '/customTextBoxt/customTextBoxts',
//     method: 'post',
//     headers: {
//       'content-type': 'application/json'
//     },
//     data
//   })
// }

// export function exportCompomentFileByComponent(componentIds, username) {
//   return request({
//     url: '/components/export?username=' + username,
//     method: 'get',
//     headers: {
//       'componentIds': componentIds
//       // responseType: 'blob'
//     }
//   })
// }

// ---------  组件升级    components/{componentId}/upgrade :  参考复制接口

export function componentUpgradeAPI(data, componentId) {
  return request({
    url: `/components/${componentId}/upgrade`,
    method: "post",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    data
  })
}

//   ----   components/deleteAll   组件回收站: 批量删除
/**
 * @function 组件回收站: 批量清除(真实删除)
 * @auther y
 * @export bulkDelete
 * @param {deleteId}  //id集合 [{id: ''}]
 * @returns
 */
export function bulkDelete(deleteId) {
  return request({
    url: "/components/deleteAll",
    method: "delete",
    data: deleteId,
    headers: {
      "content-type": "application/json"
    }
  })
}

// 批量删除(假删除)
export function bulkFalseDeletion(deleteId) {
  return request({
    url: "/components/deletedAll",
    method: "delete",
    data: deleteId,
    headers: {
      "content-type": "application/json"
    }
  })
}

/**
 * 根据组件id查询组件图片
 * @param id
 * @returns {never}
 */
export function getPicByComponentId(id) {
  return request({
    url: `/components/${id}/queryPic`,
    method: "get"
  })
}
