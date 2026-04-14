import { createRequest } from '../index'

/**
 * 获取浏览历史列表
 * @param {Object} params - 查询参数
 * @param {string} [params.targetType] - 目标类型（GOODS-商品，DEMAND-需求，POST-帖子）
 * @param {number} [params.pageNo=1] - 页码，从 1 开始
 * @param {number} [params.pageSize=10] - 每页条数，最大值为 200
 * @returns {Promise} 返回浏览历史数据
 */
export function getHistoryList(params) {
  return createRequest()('/admin-api/admin/business/history/page', {
    method: 'GET',
    params: params
  })
}