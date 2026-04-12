const baseURL = import.meta.env.VITE_PROXY_DOMAIN || '/api'

/**
 * 创建请求实例 - 封装 fetch 请求，统一处理响应格式
 * @returns {Function} 请求函数
 */
export function createRequest() {
  return (url, options = {}) => {
    const { method = 'GET', params = {}, body = null } = options
    
    // 从 localStorage 获取 token（优先取 token，若无则取 refreshToken）
    const token = localStorage.getItem('token') || localStorage.getItem('refreshToken')
    
    // 构建 URL 和查询参数
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = queryString ? `${baseURL}${url}?${queryString}` : `${baseURL}${url}`
    
    // 构建请求配置
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    // 如果存在 token，添加到请求头中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 添加 body（仅 POST/PUT/PATCH 请求）
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(body)
    }
    
    return fetch(fullUrl, config).then(response => {
      if (!response.ok) {
        return response.json().then(err => Promise.reject(err))
      }
      return response.json()
    })
  }
}

/**
 * 账号密码登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} [data.captchaVerification] - 验证码（可选）
 * @param {number} [data.socialType] - 社交平台类型（可选）
 * @param {string} [data.socialCode] - 授权码（可选）
 * @param {string} [data.socialState] - state（可选）
 * @param {boolean} [data.socialCodeValid] - 授权码是否有效（可选）
 * @param {string} [tenantId] - 租户编号，默认 1
 * @param {string} [authorization] - 认证Token，默认 "Bearer test1"
 * @returns {Promise}
 */
export function login(data, tenantId = '1', authorization = 'Bearer test1') {
  return fetch(`${baseURL}/admin-api/system/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'tenant-id': tenantId,
      'Authorization': authorization,
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err))
    }
    return response.json()
  })
}

/**
 * 用户端 App 登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} [data.captchaVerification] - 验证码（可选）
 * @param {number} [data.socialType] - 社交平台类型（可选）
 * @param {string} [data.socialCode] - 授权码（可选）
 * @param {string} [data.socialState] - state（可选）
 * @param {boolean} [data.socialCodeValid] - 授权码是否有效（可选）
 * @returns {Promise}
 */
export function appLogin(data) {
  return fetch(`${baseURL}/app-api/system/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(response => {
    if (!response.ok) {
      return response.json().then(err => Promise.reject(err))
    }
    return response.json()
  })
}
