import { createRequest } from '../index'

/**
 * 获取需求悬赏列表
 * @param {Object} params - 查询参数
 * @param {string|number} [params.categoryId] - 分类ID
 * @param {string} [params.demandTitle] - 需求标题（搜索关键词）
 * @param {string|number} params.pageNo - 页码，从1开始
 * @param {string|number} params.pageSize - 每页条数，最大值为200
 * @returns {Promise} 返回需求悬赏数据列表
 */
export function getDemandList(params = { pageNo: 1, pageSize: 6 }) {
  return createRequest()('/admin-api/admin/business/demand/page', {
    method: 'GET',
    params: params
  })
}
