

import Navbar from '@/components/navbar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import React from 'react'
import Landing from './(nondashboard)/landing/page';

export default function Home() {
  return (
     <div className='h-full w-full'>
       <Navbar/>
        <main
          className="h-full flex w-full flex-col"
          style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
        >
            <Landing />
        </main>
    </div>
  );
}
