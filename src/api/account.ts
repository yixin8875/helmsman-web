import request from '@/utils/request'
import type { ApiResponse, ListParams } from '@/types/api'
import type { Account } from '@/types/trade'
import type { Paginated } from '@/types/trade'

// 使用 POST /accounts/list 对接分页与条件查询（ListParams）
// 后端返回 data.accountss（以及可能的 total），统一映射为 { items, total }
export const getAccountList = (params?: ListParams): Promise<ApiResponse<Paginated<Account>>> => {
  const payload: ListParams = params ?? { page: 0, limit: 10 }
  return request<{ accountss: any[]; total?: number }>({
    url: '/accounts/list',
    method: 'post',
    data: payload
  }).then((res) => {
    const items: Account[] = (res.data?.accountss || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      initial_balance: a.initialBalance,
      currency: a.currency,
      created_at: a.createdAt,
      updated_at: a.updatedAt
    }))
    return { code: res.code, msg: res.msg, data: { items, total: res.data?.total ?? items.length } }
  })
}

export const createAccount = (data: Pick<Account, 'name' | 'initial_balance' | 'currency'>): Promise<ApiResponse<{ id: number }>> => {
  const payload = { name: data.name, initialBalance: data.initial_balance, currency: data.currency }
  return request<{ id: number }>({ url: '/accounts', method: 'post', data: payload })
}

export const updateAccount = (id: number | string, data: Partial<Pick<Account, 'name' | 'initial_balance' | 'currency'>>): Promise<ApiResponse<any>> => {
  const payload: any = {
    id: typeof id === 'string' ? Number(id) : id,
    name: data.name,
    currency: data.currency,
    initialBalance: data.initial_balance
  }
  return request<any>({ url: `/accounts/${id}`, method: 'put', data: payload })
}

export const deleteAccount = (id: number | string): Promise<ApiResponse<null>> => {
  return request<null>({ url: `/accounts/${id}`, method: 'delete' })
}