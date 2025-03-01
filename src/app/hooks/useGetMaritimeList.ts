import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchMaritimePorts } from '../api/importerBidList'

export const useGetMaritimeList = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['fetchMaritimePorts', query],
    queryFn: ({ pageParam = 1 }) => fetchMaritimePorts(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length + 1 : null, // Si no hay más datos, paramos la paginación
  })
}
