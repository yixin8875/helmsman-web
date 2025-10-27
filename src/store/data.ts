import { defineStore } from 'pinia'
import { getAccountList } from '@/api/account'
import { getAllStrategies } from '@/api/strategy'
import { getAllTags } from '@/api/tag'
import type { Account, Strategy, Tag } from '@/types/trade'

export const useDataStore = defineStore('data', {
  state: () => ({
    accounts: [] as Account[],
    strategies: [] as Strategy[],
    tags: [] as Tag[],
    loaded: false
  }),
  getters: {
    accountMap(state) {
      const map = new Map<number, Account>()
      state.accounts.forEach((a) => map.set(a.id, a))
      return map
    },
    strategyMap(state) {
      const map = new Map<number, Strategy>()
      state.strategies.forEach((s) => map.set(s.id, s))
      return map
    },
    tagMap(state) {
      const map = new Map<number, Tag>()
      state.tags.forEach((t) => map.set(t.id, t))
      return map
    }
  },
  actions: {
    async fetchAccounts(force = false) {
      if (!force && this.accounts.length) return
      const res = await getAccountList()
      this.accounts = res.data?.items || []
    },
    async fetchStrategies(force = false) {
      if (!force && this.strategies.length) return
      const res = await getAllStrategies()
      this.strategies = res.data?.items || []
    },
    async fetchTags(force = false) {
      if (!force && this.tags.length) return
      const res = await getAllTags()
      this.tags = res.data?.items || []
    },
    async ensureLoaded() {
      await Promise.all([this.fetchAccounts(), this.fetchStrategies(), this.fetchTags()])
      this.loaded = true
    }
  }
})