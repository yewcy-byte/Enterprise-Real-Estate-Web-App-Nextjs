import React from 'react'
import {projectsData} from "./project"
import Link from 'next/link';

const page = () => {

    type projectsObject={
        id: string
        title: string
        description: string
    }

    
  return (
        <div className='flex flex-col justify-center items-center space-y-4 p-10'>
            {projectsData.map((p:projectsObject) => {
                return(
                    <button key={p.id} className="w-60 rounded-full bg-green-200 p-3 cursor-pointer hover:shadow-md transition-all">
<Link key={p.id}href={`/playground/projects/${p.id}`}>{p.title}</Link>
                    </button>
                    
                )
            }) }
        </div>
  )
}

export default page