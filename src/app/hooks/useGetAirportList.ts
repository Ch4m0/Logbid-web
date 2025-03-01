import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchAirports } from '../api/importerBidList'

export const useGetAirportList = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['fetchAirports', query],
    queryFn: ({ pageParam = 1 }) => fetchAirports(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : null, // Si no hay más datos, paramos la paginación
  })
}
