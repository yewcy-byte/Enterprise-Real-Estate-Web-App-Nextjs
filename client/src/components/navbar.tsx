import { NAVBAR_HEIGHT } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react'
import { Button } from './button';

const Navbar = () => {
  return (
        <div
            className="fixed left-0 top-0 z-50 w-full shadow-xl"
            style={{ height: `${NAVBAR_HEIGHT}px` }}
        >
            <div className="flex h-full w-full items-center justify-between bg-primary-700 px-8 py-3 text-white">
                <div className="flex items-center gap-4 md:gap-6">
                    <Link href="/" className="cursor-pointer hover:text-primary-300!" scroll={false}>
                        <div className="flex items-center gap-3">
                            <Image src="/logo.svg" alt="Logo" width={24} height={24} className="h-6 w-6" />
                            <div className="text-xl font-bold">
                                RENT
                                <span className="font-light text-secondary-500 hover:!text-primary-300">
                                    IFUL
                                </span>
                            </div>
                        </div>
                    </Link>
                    </div>
                    <p className='text-primary-200 hidden md:block'>
                        Discover your perfect rental apartment with our advance search
                    </p>
                    <div className='flex items-center gap-5'>
                        <Link href="/signin">
                        <Button variant = "outline"
                        className="text-white border-white bg-transparent hover:bg-white hover:text-primary-700 rounded-lg">
                            Sign In
                        </Button>
                        </Link>

                          <Link href="/signup">
                        <Button variant = "secondary"
                        className="text-white bg-secondary-600 hover:bg-white hover:text-primary-700 rounded-lg">
                            Sign Up
                        </Button>
                        </Link>
                    </div>
                
            </div>
        </div>
  )
}

export default Navbar;