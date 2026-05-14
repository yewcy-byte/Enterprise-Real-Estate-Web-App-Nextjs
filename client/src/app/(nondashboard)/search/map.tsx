"use client"

import React, { useEffect } from 'react'
import { useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from '@/state/redux';
import { useGetPropertiesQuery } from '@/state/api';
import type { Property } from '@/types/prismaTypes';


mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string

const Map = () => {

    const mapCotainerRef = useRef(null);
    const filters = useAppSelector((state: any) => state.global.filters);
    const isFiltersFullOpen = useAppSelector((state: any) => state.global.isFiltersFullOpen);

    const {
        data: properties,
        isLoading,
        isError} = useGetPropertiesQuery(filters);

    useEffect(() => {
        if (!mapCotainerRef.current) return;
        
        try {
            let isActive = true;
            const map = new mapboxgl.Map({
                container: mapCotainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: (filters.coordinates || [-74.5, 40]) as any,
                zoom: 9,
            });

            console.log('Map initialized, properties:', properties?.length || 0);

            if (properties && properties.length > 0) {
                properties.forEach((property) => {
                    try {
                        console.log('Property location:', property.name, property.location);
                        const marker = createPropertyMarker(property, map);
                        const markerElement = marker.getElement();
                        markerElement.style.filter = 'invert(1)';
                        console.log('Marker added for:', property.name);
                    } catch (err) {
                        console.error('Error adding marker for', property.name, err);
                    }
                });
            }

            const resizeTimer = window.setTimeout(() => {
                if (!isActive) return;
                try {
                    map.resize();
                } catch {
                    // no-op: map may already be disposed during route changes
                }
            }, 700);
        
            return () => {
                isActive = false;
                window.clearTimeout(resizeTimer);
                map.remove();
            };
        } catch (error) {
            console.error('Map initialization error:', error);
            return () => {};
        }
    }, [filters, properties])
    

   
      return (
    <div className='flex-1 flex relative rounded-xl overflow-hidden'>
        <div className='map-container rounded-xl w-full h-full'
        ref={mapCotainerRef}>

        </div>
    </div>
  )
}

const createPropertyMarker = (property: Property , map: mapboxgl.Map): mapboxgl.Marker => {

    const coordinates = property.location?.coordinates;
    
    if (!coordinates) {
        console.log('Missing coordinates for property:', property.name, 'location:', property.location);
        throw new Error('Missing coordinates');
    }

    const marker = new mapboxgl.Marker()
    .setLngLat([coordinates.longitude || 0, coordinates.latitude || 0]) 
   .setPopup(
      new mapboxgl.Popup().setHTML(
        `
        <div class="marker-popup">
          <div class="marker-popup-image"></div>
          <div>
            <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
            <p class="marker-popup-price">
              $${property.pricePerMonth}
              <span class="marker-popup-price-unit"> / month</span>
            </p>
          </div>
        </div>
        `
        )
    )
    .addTo(map);
    
    return marker;
}

export default Map