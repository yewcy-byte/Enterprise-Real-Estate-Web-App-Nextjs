"use client"
import Loading from '@/components/ui/Loading'
import { useGetAuthUserQuery, useGetCurrentResidencesQuery, useGetPropertiesQuery, useGetTenantQuery } from '@/state/api'
import React from 'react'
import Header from '@/components/ui/Header'
import Card from '@/components/ui/Card'

const Residences = () => {

  const {data: authUser} = useGetAuthUserQuery()
  const {data: tenant} = useGetTenantQuery(authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId
    }
  )

  const {
    data: currentResidences,
    isLoading,
    isError
  } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.userId || "",{
   
    skip: !authUser?.cognitoInfo?.userId
})

  if (isLoading) return <Loading />
  if(isError) return <div>Error loading current residences.</div>

  return (
    <div className='dashboard-container'>
      <Header 
      title="Current Residences"
      subtitle="Browse and manage your current residence listings"
      />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {currentResidences?.map((property) => (
             <Card
              key={property.id}
              property={property}
              isFavorite={true}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/tenants/residences/${property.id}`}
                                        />))}
      </div>
      {(!currentResidences||currentResidences.length === 0) && (
        <p>You don't have any current residences.</p>
      )}
    </div>
  )
}

export default Residences