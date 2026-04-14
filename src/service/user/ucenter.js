import { createRequest } from "@/service";

const request = createRequest();

/**
 * 获取我的文章列表
 * @returns {Promise}
 */
export function getMyArticles() {
  return request("/admin-api/admin/business/forum/post/me", {
    method: "GET",
  });
}

/**
 * 获取我的服务（商品）列表
 * @returns {Promise}
 */
export function getMyServices() {
  return request("/admin-api/admin/business/goods/me", {
    method: "GET",
  });
}

/**
 * 获取我的需求列表
 * @returns {Promise}
 */
export function getMyDemands() {
  return request("/admin-api/admin/business/demand/me", {
    method: "GET",
  });
}
