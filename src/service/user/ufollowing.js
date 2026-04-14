import { createRequest } from '../index'

/**
 * 获取关注订阅文章列表
 * @param {Object} params - 查询参数
 * @param {number} [params.pageNo=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise} 返回关注文章列表数据
 */
export function getFollowingPosts(params) {
  return createRequest()('/admin-api/admin/business/home/following/posts', {
    method: 'GET',
    params: params
  })
}
