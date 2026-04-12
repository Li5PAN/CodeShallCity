import { createRequest } from '../index'

/**
 * 获取首页精选服务列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.pageNum - 页码，默认1
 * @param {string|number} params.pageSize - 每页条数，默认6
 * @returns {Promise} 返回精选服务数据列表
 */
export function getHomeGoods(params = { pageNum: 1, pageSize: 6 }) {
  return createRequest()('/app-api/business/home/goods', {
    method: 'GET',
    params: params
  })
}

/**
 * 获取首页需求悬赏列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.pageNum - 页码，默认1
 * @param {string|number} params.pageSize - 每页条数，默认6
 * @returns {Promise} 返回首页需求悬赏数据列表
 */
export function getHomeDemands(params = { pageNum: 1, pageSize: 6 }) {
  return createRequest()('/app-api/business/home/demands', {
    method: 'GET',
    params: params
  })
}
