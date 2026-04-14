import { createRequest } from '../index'

/**
 * 获取收藏列表
 * @param {Object} params - 查询参数
 * @param {string} [params.targetType] - 目标类型（GOODS-商品，DEMAND-需求，POST-帖子）
 * @param {number} [params.pageNo=1] - 页码，从 1 开始
 * @param {number} [params.pageSize=10] - 每页条数，最大值为 200
 * @returns {Promise} 返回收藏列表数据
 */
export function getCollectList(params) {
  return createRequest()('/admin-api/admin/business/collect/page', {
    method: 'GET',
    params: params
  })
}
