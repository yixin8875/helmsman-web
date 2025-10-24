import request from '@/utils/request'
import type { ApiResponse, ListParams } from '@/types/api'
import type { Tag } from '@/types/trade'
import type { Paginated } from '@/types/trade'

// 使用 POST /tags/list 对接分页与条件查询（ListParams）
// 后端返回 data.tagss + total，这里映射为统一的 { items, total }
export const getTagList = (params?: ListParams): Promise<ApiResponse<Paginated<Tag>>> => {
  return request<{ tagss: any[]; total: number}>({
    url: '/tags/list',
    method: 'post',
    data: params
  }).then((res) => {
    const items: Tag[] = (res.data?.tagss || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      created_at: t.createdAt,
      updated_at: t.updatedAt
    }))
    return {
      code: res.code,
      msg: res.msg,
      data: { items, total: res.data?.total ?? 0 }
    }
  })
}

// 定义与后端 UpdateTagsByIDRequest 对齐的请求体
export interface UpdateTagRequest {
  id?: number
  userID?: number
  name?: string
  color?: string
}

export const createTag = (data: Pick<Tag, 'name' | 'color'>): Promise<ApiResponse<Tag>> => {
  return request<Tag>({
    url: '/tags',
    method: 'post',
    data
  })
}

// 更新标签：PUT /tags/:id，包含 path id 与 body.id（后端定义）
export const updateTag = (id: number | string, data: UpdateTagRequest): Promise<ApiResponse<Tag>> => {
  const payload: UpdateTagRequest = { ...data, id: typeof id === 'string' ? Number(id) : id }
  return request<Tag>({
    url: `/tags/${id}`,
    method: 'put',
    data: payload
  })
}

export const deleteTag = (id: number): Promise<ApiResponse<null>> => {
  return request<null>({
    url: `/tags/${id}`,
    method: 'delete'
  })
}