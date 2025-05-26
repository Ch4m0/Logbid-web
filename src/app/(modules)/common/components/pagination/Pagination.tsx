'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { generatePagination } from '@/src/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'

export default function Pagination({ totalPages }: { totalPages: number }) {
  const { t } = useTranslation()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const allPages = generatePagination(currentPage, totalPages)

  const createPageURL = (page: string | number) => {
    const params = new URLSearchParams(searchParams)
    if (page !== undefined) {
      params.set('page', page.toString())
    } else {
      params.set('page', '1')
    }
    return `${pathName}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center space-x-1" aria-label="Pagination">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        className={clsx(
          "flex items-center gap-1 px-2.5 py-2 text-sm",
          currentPage <= 1 
            ? "cursor-not-allowed opacity-50" 
            : "hover:bg-accent hover:text-accent-foreground"
        )}
        disabled={currentPage <= 1}
        asChild={currentPage > 1}
      >
        {currentPage > 1 ? (
          <Link href={createPageURL(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('pagination.previous')}</span>
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t('pagination.previous')}</span>
          </>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {allPages.map((page, index) => {
          const isActive = currentPage === page
          const isEllipsis = page === '...'

          if (isEllipsis) {
            return (
              <div
                key={`ellipsis-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={clsx(
                "h-8 w-8 p-0 text-sm",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              asChild={!isActive}
            >
              {isActive ? (
                <span>{page}</span>
              ) : (
                <Link href={createPageURL(page)}>
                  {page}
                </Link>
              )}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        className={clsx(
          "flex items-center gap-1 px-2.5 py-2 text-sm",
          currentPage >= totalPages 
            ? "cursor-not-allowed opacity-50" 
            : "hover:bg-accent hover:text-accent-foreground"
        )}
        disabled={currentPage >= totalPages}
        asChild={currentPage < totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={createPageURL(currentPage + 1)}>
            <span className="hidden sm:inline">{t('pagination.next')}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            <span className="hidden sm:inline">{t('pagination.next')}</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  )
}
