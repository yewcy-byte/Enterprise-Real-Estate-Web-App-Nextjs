import React from 'react'
import { usePathname } from 'next/navigation';
import { useSidebar } from './sidebar';

const AppSidebar = ({userType} : AppSidebarProps) => {
  const pathname = usePathname();
  const {toggleSidebar, open} = useSidebar();
  
  
    return (
    <div>AppSidebar</div>
  )
}

export default AppSidebar