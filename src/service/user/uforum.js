import { createRequest } from '../index'

/**
 * 获取论坛文章分页列表
 * @param {Object} params - 查询参数
 * @param {string} [params.categoryId] - 论坛分类ID
 * @param {string} [params.title] - 文章标题（搜索用）
 * @param {string|number} params.pageNo - 页码，从1开始
 * @param {string|number} params.pageSize - 每页条数，最大值200
 * @returns {Promise} 返回论坛文章分页数据
 */
export function getPostPage(params) {
  return createRequest()('/admin-api/admin/business/forum/post/page', {
    method: 'GET',
    params: params
  })
}

/**
 * 获取论坛文章详情
 * @param {number} id - 文章ID
 * @returns {Promise} 返回文章详情数据
 */
export function getPostDetail(id) {
  return createRequest()(`/admin-api/admin/business/forum/post/detail/${id}`, {
    method: 'GET'
  })
}

/**
 * 点赞文章
 * @param {number} id - 文章ID
 * @returns {Promise} 返回点赞结果
 */
export function likePost(id) {
  return createRequest()(`/admin-api/admin/business/forum/post/${id}/like`, {
    method: 'POST'
  })
}

/**
 * 取消点赞文章
 * @param {number} id - 文章ID
 * @returns {Promise} 返回取消点赞结果
 */
export function unlikePost(id) {
  return createRequest()(`/admin-api/admin/business/forum/post/${id}/like`, {
    method: 'DELETE'
  })
}

/**
 * 收藏文章
 * @param {number} id - 文章ID
 * @returns {Promise} 返回收藏结果
 */
export function collectPost(id) {
  return createRequest()(`/admin-api/admin/business/forum/post/${id}/collect`, {
    method: 'POST'
  })
}

/**
 * 取消收藏文章
 * @param {number} id - 文章ID
 * @returns {Promise} 返回取消收藏结果
 */
export function uncollectPost(id) {
  return createRequest()(`/admin-api/admin/business/forum/post/${id}/collect`, {
    method: 'DELETE'
  })
}

/**
 * 获取评论列表
 * @param {Object} params - 查询参数
 * @param {number} params.postId - 文章ID
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise} 返回评论分页数据
 */
export function getCommentPage(params) {
  return createRequest()('/admin-api/admin/business/forum/comment/page', {
    method: 'GET',
    params: params
  })
}

/**
 * 创建评论/回复
 * @param {Object} data - 评论数据
 * @param {number} data.postId - 文章ID
 * @param {number|null} data.parentId - 父评论ID（一级评论为null，二级评论为父评论ID）
 * @param {string} data.content - 评论内容
 * @returns {Promise} 返回创建结果
 */
export function createComment(data) {
  return createRequest()('/admin-api/admin/business/forum/comment/create', {
    method: 'POST',
    params: { postId: data.postId },
    body: {
      parentId: data.parentId || null,
      content: data.content
    }
  })
}
