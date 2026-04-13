import { createRequest } from '../index.js'

const request = createRequest()

/**
 * 获取商品分类列表
 * @param {Object} params - 查询参数
 * @param {string} [params.id] - 分类ID
 * @param {string} [params.parentId] - 父分类ID，0表示根分类
 * @param {string} [params.categoryName] - 分类名称
 * @param {string} [params.status] - 状态：0-禁用，1-启用
 * @param {string} [params.type] - 用途：SERVICE-服务，DEMAND-需求，BOTH-两者
 * @returns {Promise}
 */
export function getCategoryList(params = {}) {
  return request('/admin-api/business/category/list', {
    method: 'GET',
    params: {
      type: 'SERVICE',
      ...params,
    },
  })
}

/**
 * 获取需求分类列表
 * @param {Object} params - 查询参数
 * @param {string} [params.id] - 分类ID
 * @param {string} [params.parentId] - 父分类ID，0表示根分类
 * @param {string} [params.categoryName] - 分类名称
 * @param {string} [params.status] - 状态：0-禁用，1-启用
 * @returns {Promise}
 */
export function getDemandCategoryList(params = {}) {
  return createRequest()('/admin-api/business/category/list', {
    method: 'GET',
    params: {
      type: 'DEMAND',
      ...params,
    },
  })
}

/**
 * 获取服务商品分页列表
 * @param {Object} params - 查询参数
 * @param {string|number} [params.categoryId] - 分类ID，可选
 * @param {string} [params.goodsTitle] - 商品标题，可选
 * @param {string|number} params.pageNo - 页码，从1开始
 * @param {string|number} params.pageSize - 每页条数，最大值200
 * @returns {Promise}
 */
export function getGoodsPage(params = {}) {
  return request('/admin-api/admin/business/goods/page', {
    method: 'GET',
    params: {
      pageNo: 1,
      pageSize: 12,
      ...params,
    },
  })
}

/**
 * 获取商品详情
 * @param {string|number} id - 商品ID
 * @returns {Promise}
 */
export function getGoodsDetail(id) {
  return request(`/admin-api/admin/business/goods/detail/${id}`, {
    method: 'GET',
  })
}
