import React, { useEffect, useState } from 'react'
import { useGetAuthUserQuery, useAddFavouritePropertyMutation, useRemoveFavouritePropertyMutation, useGetPropertiesQuery } from '@/state/api';
import { Property } from '@/types/prismaTypes';
import Card from '@/components/ui/Card';
import { useAppSelector } from '@/state/redux';
import CardCompact from '@/components/ui/CardCompact';

const Listings = () => {

    const { data: authUser } = useGetAuthUserQuery();
    const [addFavourite] = useAddFavouritePropertyMutation();
    const [removeFavourite] = useRemoveFavouritePropertyMutation();
    const viewMode = useAppSelector((state) => state.global.viewMode);
    const filters = useAppSelector((state) => state.global.filters);

    const {
        data: properties,
        isLoading,
        isError
    } = useGetPropertiesQuery(filters);
    const [localFavorites, setLocalFavorites] = useState<Set<number>>(new Set());
    const favoriteIdsSignature = (authUser?.userInfo?.favorites ?? [])
        .map((f: Property) => f.id)
        .sort((a: number, b: number) => a - b)
        .join(',');

    useEffect(() => {
        const ids = favoriteIdsSignature
            ? favoriteIdsSignature.split(',').map((id) => Number(id))
            : [];
        setLocalFavorites(new Set(ids));
    }, [favoriteIdsSignature]);

    const handleFavouriteToggle = async (propertyId: number) => {
        if (!authUser || authUser.userRole !== "tenant") return;

        const isFavourite = localFavorites.has(propertyId);

        // optimistic update
        setLocalFavorites(prev => {
            const next = new Set(prev);
            if (isFavourite) next.delete(propertyId);
            else next.add(propertyId);
            return next;
        });

        try {
            if (isFavourite) {
                await removeFavourite({cognitoId: authUser.cognitoInfo.userId, propertyId}).unwrap();
            } else {
                await addFavourite({cognitoId: authUser.cognitoInfo.userId, propertyId}).unwrap();
            }
        } catch (err) {
            // revert optimistic update on error
            setLocalFavorites(prev => {
                const next = new Set(prev);
                if (isFavourite) next.add(propertyId);
                else next.delete(propertyId);
                return next;
            });
            console.error('Failed to toggle favourite', (err as any)?.data ?? err);
        }
    }
  

    if (isLoading) return <>Loading...</>
    if (isError || !properties) return <>Error loading properties.</>
  

    return <div className= "w-full">
        <h3 className='text-sm px-4 font-bold'>
            {properties.length}{" "}
            <span className="text-gray-700 font -normal">
                Places in {filters.location}
            </span>
        </h3>
        <div className='flex'>
            <div className='p-4 w-full'>
                                {properties?.map((property) =>
                                    viewMode === "grid" ? (
                                        <Card
                                            key={property.id}
                                            property={property}
                                            isFavorite={localFavorites.has(property.id)}
                                            onFavoriteToggle={() => handleFavouriteToggle(property.id)}
                                            showFavoriteButton={authUser?.userRole === "tenant"}
                                            propertyLink={`/search/${property.id}`}
                                        />
                                    ) : (
                                          <CardCompact
                                            key={property.id}
                                            property={property}
                                            isFavorite={localFavorites.has(property.id)}
                                            onFavoriteToggle={() => handleFavouriteToggle(property.id)}
                                            showFavoriteButton={authUser?.userRole === "tenant"}
                                            propertyLink={`/search/${property.id}`}
                                        />
                                    )
                                )}
            </div>
        </div>
    </div>
  
  
  
  
    return (
    <div>Listings</div>
  )
}

export default Listings