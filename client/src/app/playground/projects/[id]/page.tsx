import React from 'react'
import {projectsData} from "../project"
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    type ProjectType = (typeof projectsData)[number]
    const { id } = await params

    const matchingProject: ProjectType | undefined = projectsData.find(
        (project) => project.id === id
    )

    if (!matchingProject) {
        return <h1 className='text-red-400'>No Matching Project Found</h1>
    }

    return (
        <div>
            <h1>{matchingProject.id}</h1>
            <h1>{matchingProject.title}</h1>
            <h1>{matchingProject.description}</h1>
        </div>
    )
}
  

export default page