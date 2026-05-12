import React from 'react'
import Link from "next/link"
const layout = ({children} : {children: React.ReactNode}) => {
  return (
<div>
    <div className='flex h-15  items-center justify-center bg-black text-white space-x-10'>
        <Link href="/playground">Main</Link>
        <Link href="/playground/country">Country</Link>
        <Link href="/playground/weather">Weather</Link>
        <Link href="/playground/projects">Projects</Link>
        <Link href="/playground/guestbook">GuestBook</Link>
        <Link href="/landing"><span>RENT</span><span className='text-secondary-400'>iful</span></Link>
    </div>
    <main>{children}</main>
</div>
)
}

export default layout