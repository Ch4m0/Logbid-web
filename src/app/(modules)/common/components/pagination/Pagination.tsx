'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { generatePagination } from '@/src/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './pagination.module.scss' // Importar estilos SCSS
import ArrowLeftIcon from '@/src/icons/ArrowLeftIcon'
import ArrowRightIcon from '@/src/icons/ArrowRightIcon'

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const allPages = generatePagination(currentPage, totalPages)

  const createPageURL = (page: string | number) => {
    const params = new URLSearchParams(searchParams)
    if (page !== undefined) {
      // Verificar si page es undefined
      params.set('page', page.toString())
    } else {
      // Proporcionar un valor predeterminado o manejar el caso en el que page es undefined
      params.set('page', '1') // Por ejemplo, aquí lo establecemos en 1
    }

    return `${pathName}?${params.toString()}`
  }

  return (
    <div className={styles.pagination}>
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className={styles.pages}>
        {allPages.map((page, index) => {
          let position: 'first' | 'last' | 'single' | 'middle' | undefined

          if (index === 0) position = 'first'
          if (index === allPages.length - 1) position = 'last'
          if (allPages.length === 1) position = 'single'
          if (page === '...') position = 'middle'

          return (
            <PaginationNumber
              key={page}
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={currentPage === page}
            />
          )
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  )
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string
  href: string
  position?: 'first' | 'last' | 'middle' | 'single'
  isActive: boolean
}) {
  const className = clsx(styles.page, {
    [styles.active]: isActive,
    [styles.middle]: position === 'middle',
  })

  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  )
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string
  direction: 'left' | 'right'
  isDisabled?: boolean
}) {
  const className = clsx(styles.arrow, {
    [styles.disabled]: isDisabled,
    [styles.left]: direction === 'left',
    [styles.right]: direction === 'right',
  })

  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className={styles.icon} />
    ) : (
      <ArrowRightIcon className={styles.icon} />
    )

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  )
}
