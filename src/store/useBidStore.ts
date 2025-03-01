import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BidStoreState {
  agentCode: string
  agentName: string
  originBid: string
  finishBid: string
  codeBid: number | null
  startDate: string
  finishDate: string
  price: string
  market: string | null
  bidDataForAgent: any
  setBidData: (data: {
    agentCode: string
    agentName: string
    originBid: string
    finishBid: string
    codeBid: number
    startDate: string
    finishDate: string
    price: string
  }) => void
  setMarketData: (id: string | null) => void
  setDetailBidDataForAgent: (bid: any) => void
}

export const useBidStore = create<BidStoreState>()(
  persist(
    (set) => ({
      agentCode: '',
      agentName: 'Agent Name',
      originBid: '',
      finishBid: '',
      codeBid: null,
      startDate: '',
      finishDate: '',
      price: '',
      market: null,
      bidDataForAgent: {},
      setBidData: (data) => set((state) => ({ ...state, ...data })),
      setMarketData: (id: string | null) =>
        set((state) => ({ ...state, ...{ market: id } })),
      setDetailBidDataForAgent: (bid: any) =>
        set((state) => ({ ...state, ...{ bidDataForAgent: bid } })),
    }),
    { name: 'bidStore' }
  )
)
