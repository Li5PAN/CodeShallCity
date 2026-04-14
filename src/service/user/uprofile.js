import { createRequest } from '@/service/index'

const request = createRequest()

/**
 * 获取用户数据概览
 * @returns {Promise}
 */
export function getUserStats() {
  return request('/admin-api/admin/business/user/stats')
}

/**
 * 编辑个人资料
 * @param {Object} data - 编辑数据
 * @param {string} [data.nickname] - 昵称
 * @param {string} [data.avatar] - 头像URL
 * @param {string} [data.bio] - 个人简介
 * @returns {Promise}
 */
export function updateProfile(data) {
  return request('/admin-api/admin/business/user/profile', {
    method: 'PUT',
    body: data
  })
}
