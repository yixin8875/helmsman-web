import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import type { Trade, TradeListData, TradeDetailData } from '@/types/trade'

export interface TradeListParams {
  start_date?: string
  end_date?: string
  account_id?: number
  strategy_id?: number
  symbol?: string
  page?: number
  size?: number
}

export const getTradeList = (params?: TradeListParams): Promise<ApiResponse<TradeListData>> => {
  return request<TradeListData>({
    url: '/trades',
    method: 'get',
    params
  })
}

export const getTradeDetail = (id: number): Promise<ApiResponse<TradeDetailData>> => {
  return request<TradeDetailData>({
    url: `/trades/${id}`,
    method: 'get'
  })
}

export const createTrade = (data: Trade): Promise<ApiResponse<TradeDetailData>> => {
  return request<TradeDetailData>({
    url: '/trades',
    method: 'post',
    data
  })
}

export const updateTrade = (id: number, data: Trade): Promise<ApiResponse<TradeDetailData>> => {
  return request<TradeDetailData>({
    url: `/trades/${id}`,
    method: 'put',
    data
  })
}

export const deleteTrade = (id: number): Promise<ApiResponse<null>> => {
  return request<null>({
    url: `/trades/${id}`,
    method: 'delete'
  })
}