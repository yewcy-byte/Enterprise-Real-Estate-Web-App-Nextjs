"use client"; 

import React from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Navbar from '@/components/navbar'
import {  useGetAuthUserQuery } from '@/state/api'
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const layout = ({children} : {children : React.ReactNode}) => {
 const {data:authUser, isLoading: authLoading} = useGetAuthUserQuery();
 const router = useRouter();  
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authUser) {
      const userRole = authUser.userRole?.toLowerCase();
      if ((userRole === "manager" && pathname.startsWith("/search")) || (userRole === "manager" && pathname === "/")) {
        router.push("/managers/properties", { scroll: false });
      }
      setIsLoading(false);
    }
  }, [authUser, router, pathname])

    if(authLoading || isLoading) return <>Loading...</>

 
  return (
    <div className='h-full w-full'>
       <Navbar/>
        <main
          className="h-full flex w-full flex-col"
          style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
        >
            {children}
        </main>
    </div>
  )
}

export default layout