import { createRequest } from '../index'

/**
 * 获取订单数据概览
 * @returns {Promise} 返回订单概览数据
 */
export function getOrderOverview() {
  return createRequest()('/admin-api/admin/business/order/overview', {
    method: 'GET'
  })
}

/**
 * 分页获取订单列表
 * @param {Object} params 查询参数
 * @param {string} params.orderType 订单类型（SERVICE-服务购买，DEMAND-需求悬赏）
 * @param {string} params.status 订单状态（PENDING-待处理，PROCESSING-进行中，DELIVERED-待验收，COMPLETED-已完成，CANCELLED-已取消，FAILED-已失败）
 * @param {string} params.roleType 角色类型（BUYER-买家，SELLER-卖家）
 * @param {string} params.keyword 关键词搜索
 * @param {number} params.pageNo 页码，从 1 开始
 * @param {number} params.pageSize 每页条数，最大值为 200
 * @returns {Promise} 返回分页订单数据
 */
export function getOrderPage(params) {
  return createRequest()('/admin-api/admin/business/order/page', {
    method: 'GET',
    params
  })
}

/**
 * 批量导出订单（返回文件流）
 * @param {Object} params 导出参数
 * @param {string} params.orderType 订单类型（SERVICE-服务购买，DEMAND-需求悬赏）
 * @param {string} params.status 订单状态筛选（可选）
 * @param {string} params.roleType 角色类型（BUYER-买家，SELLER-卖家）
 * @param {string} params.keyword 关键词搜索
 * @returns {Promise} 返回文件流数据
 */
export function exportOrders(params) {
  return createRequest()('/admin-api/admin/business/order/export', {
    method: 'GET',
    params,
    responseType: 'blob'
  })
}
