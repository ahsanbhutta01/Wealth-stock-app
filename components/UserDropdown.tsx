'use client'

import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import NavItems from './NavItems'
import { signOut } from '@/lib/actions/action'


const UserDropdown = ({ user, initialStocks }: { user: User, initialStocks: StockWithWatchlistStatus[] }) => {
  const router = useRouter();

  async function hanldeSignOut() {
    await signOut();
    router.push('/sign-in')
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className='flex items-center gap-3 text-gray-400 hover:text-yellow-500'>
          <Avatar className='size-8'>
            {/* <AvatarImage src='/favicon.svg'/> */}
            <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
              {user?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-base font-medium text-gray-400">
              {user.name}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='text-gray-400 mr-1'>
        <DropdownMenuLabel>
          <div className="flex relative items-center gap-3 py-1">
            <Avatar className='size-10'>
              {/* <AvatarImage src='/favicon.svg'/> */}
              <AvatarFallback className='bg-yellow-500 text-yellow-900 text-sm font-bold'>
                {user.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ">
              <span className="text-base font-medium text-gray-400">
                {user.name}
              </span>
              <span className='text-sm text-gray-500'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='bg-gray-600' />
        <DropdownMenuItem onClick={hanldeSignOut} className='text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer'>
          <LogOut className='size-4 mr-2 hidden sm:block' />
          Logout
        </DropdownMenuItem>
        <DropdownMenuSeparator className='hidden sm:block bg-gray-600' />
        <nav className='sm:hidden'>
          <NavItems initialStocks={initialStocks}/>
        </nav>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown