import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Strategy } from '@/types/trade'
import type { Paginated } from '@/types/trade'

export const getStrategyList = (params?: { page?: number; size?: number }): Promise<ApiResponse<Paginated<Strategy>>> => {
  return request<Paginated<Strategy>>({
    url: '/strategies',
    method: 'get',
    params
  })
}

export const createStrategy = (data: Pick<Strategy, 'name' | 'description'>): Promise<ApiResponse<Strategy>> => {
  return request<Strategy>({
    url: '/strategies',
    method: 'post',
    data
  })
}

export const updateStrategy = (id: number, data: Partial<Pick<Strategy, 'name' | 'description'>>): Promise<ApiResponse<Strategy>> => {
  return request<Strategy>({
    url: `/strategies/${id}`,
    method: 'put',
    data
  })
}

export const deleteStrategy = (id: number): Promise<ApiResponse<null>> => {
  return request<null>({
    url: `/strategies/${id}`,
    method: 'delete'
  })
}