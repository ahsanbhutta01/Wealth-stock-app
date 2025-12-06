'use client'

import { NAV_ITEMS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import SearchCommand from './SearchCommand'

const NavItems = ({ initialStocks }: { initialStocks: StockWithWatchlistStatus[] }) => {
  const pathname = usePathname()

  function isActive(path: string) {
    if (path === '/') return pathname === '/';

    return pathname.startsWith(path)
  }

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {
        NAV_ITEMS.map(({ href, title }) => {
          if (href === '/search') return (
            <li key="search-trigger">
              <SearchCommand
                renderAs='text'
                label='Search'
                initialStocks={initialStocks}
              />
            </li>
          )

          return <li key={href}>
            <Link href={href} className={cn(
              "hover:text-yellow-500 transition-colors",
              isActive(href) ? 'text-gray-100' : ""
            )}>
              {title}
            </Link>
          </li>
        })
      }
    </ul>
  )
}

export default NavItems