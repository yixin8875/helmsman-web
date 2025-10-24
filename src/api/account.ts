import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Account } from '@/types/trade'
import type { Paginated } from '@/types/trade'

export const getAccountList = (params?: { page?: number; size?: number }): Promise<ApiResponse<Paginated<Account>>> => {
  return request<Paginated<Account>>({
    url: '/accounts',
    method: 'get',
    params
  })
}

export const createAccount = (data: Pick<Account, 'name' | 'initial_balance' | 'currency'>): Promise<ApiResponse<Account>> => {
  return request<Account>({
    url: '/accounts',
    method: 'post',
    data
  })
}

export const updateAccount = (id: number, data: Partial<Pick<Account, 'name' | 'initial_balance' | 'currency'>>): Promise<ApiResponse<Account>> => {
  return request<Account>({
    url: `/accounts/${id}`,
    method: 'put',
    data
  })
}

export const deleteAccount = (id: number): Promise<ApiResponse<null>> => {
  return request<null>({
    url: `/accounts/${id}`,
    method: 'delete'
  })
}