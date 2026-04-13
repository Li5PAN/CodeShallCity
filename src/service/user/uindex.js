import { createRequest } from '../index'

/**
 * 获取最热服务商品列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.pageNo - 页码，从1开始
 * @param {string|number} params.pageSize - 每页条数，最大值200
 * @returns {Promise} 返回最热服务商品数据列表
 */
export function getHomeGoods(params = { pageNo: 1, pageSize: 10 }) {
  return createRequest()('/admin-api/admin/business/home/goods', {
    method: 'GET',
    params: params
  })
}

/**
 * 获取最新需求悬赏列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.pageNo - 页码，从1开始
 * @param {string|number} params.pageSize - 每页条数，最大值200
 * @returns {Promise} 返回最新需求悬赏数据列表
 */
export function getHomeDemands(params = { pageNo: 1, pageSize: 10 }) {
  return createRequest()('/admin-api/admin/business/home/demands', {
    method: 'GET',
    params: params
  })
}

/**
 * 获取论坛文章推荐列表
 * @param {Object} params - 查询参数
 * @param {string|number} params.pageNo - 页码，从1开始
 * @param {string|number} params.pageSize - 每页条数，最大值200
 * @returns {Promise} 返回论坛文章推荐数据列表
 */
export function getHomePosts(params = { pageNo: 1, pageSize: 10 }) {
  return createRequest()('/admin-api/admin/business/home/posts', {
    method: 'GET',
    params: params
  })
}
