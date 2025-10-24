import request from '@/utils/request'
import type { ApiResponse, ListParams } from '@/types/api'
import type { Strategy } from '@/types/trade'
import type { Paginated } from '@/types/trade'

// 使用 POST /strategies/list 对接分页与条件查询（ListParams）
// 后端返回 data.strategiess（以及可能的 total），统一映射为 { items, total }
export const getStrategyList = (params?: ListParams): Promise<ApiResponse<Paginated<Strategy>>> => {
  return request<{ strategiess: any[]; total?: number }>({
    url: '/strategies/list',
    method: 'post',
    data: params
  }).then((res) => {
    const items: Strategy[] = (res.data?.strategiess || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      created_at: s.createdAt,
      updated_at: s.updatedAt
    }))
    return {
      code: res.code,
      msg: res.msg,
      data: { items, total: res.data?.total ?? items.length }
    }
  })
}

// 创建策略：按后端定义返回 { data: { id } }
export const createStrategy = (data: Pick<Strategy, 'name' | 'description'>): Promise<ApiResponse<{ id: number }>> => {
  return request<{ id: number }>({
    url: '/strategies',
    method: 'post',
    data
  })
}

// 更新策略：路径携带 id，同时在请求体中包含 id（后端定义需要）
export const updateStrategy = (
  id: number | string,
  data: (Partial<Pick<Strategy, 'name' | 'description'>> & { userID?: number; id?: number | string })
): Promise<ApiResponse<any>> => {
  return request<any>({
    url: `/strategies/${id}`,
    method: 'put',
    data: { id, ...data }
  })
}

export const deleteStrategy = (id: number | string): Promise<ApiResponse<null>> => {
  return request<null>({
    url: `/strategies/${id}`,
    method: 'delete'
  })
}