import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Tag } from '@/types/trade'
import type { Paginated } from '@/types/trade'

export const getTagList = (params?: { page?: number; size?: number }): Promise<ApiResponse<Paginated<Tag>>> => {
  return request<Paginated<Tag>>({
    url: '/tags',
    method: 'get',
    params
  })
}

export const createTag = (data: Pick<Tag, 'name' | 'color'>): Promise<ApiResponse<Tag>> => {
  return request<Tag>({
    url: '/tags',
    method: 'post',
    data
  })
}

export const updateTag = (id: number, data: Partial<Pick<Tag, 'name' | 'color'>>): Promise<ApiResponse<Tag>> => {
  return request<Tag>({
    url: `/tags/${id}`,
    method: 'put',
    data
  })
}

export const deleteTag = (id: number): Promise<ApiResponse<null>> => {
  return request<null>({
    url: `/tags/${id}`,
    method: 'delete'
  })
}