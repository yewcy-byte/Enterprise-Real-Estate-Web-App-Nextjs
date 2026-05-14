"use client"

import { useSearchParams } from 'next/navigation'
import React from 'react'
import { useAppDispatch } from '@/state/redux';
import { useAppSelector } from '@/state/redux';
import { NAVBAR_HEIGHT } from '@/lib/constants';
import FiltersBar from './FiltersBar';
import FiltersFull from './FiltersFull';
import { useEffect } from 'react';
import { cleanParams } from '@/lib/utils';
import { setFilters } from '@/state';
import Map from './map';
import Listings from './Listings';

const SearchPage = () => {

    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);
  
  
  useEffect(() => {
    const initialFilters = Array.from(searchParams.entries()).reduce(
        (acc: any, entry: [string, string]) => {
            const [key, value] = entry;
            if (key === "priceRange" || key === "squareFeet") {
                acc[key] = value.split(",").map((v: string) => (v === ""? null : Number(v)));
        }else if (key === "coordinates"){
            acc[key] = value.split(",").map(Number);
        }else{
            acc[key]=value === "any" ? null : value
        }

            return acc;
    }, {} as any
    )
    const cleanFilters = cleanParams(initialFilters);
    dispatch(setFilters(cleanFilters));
}, [])
  
    return (
    <div className='w-full mx-auto px-5 flex flex-col'
        style={{
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
           
        }}
    >
        <FiltersBar />
        <div className="flex flex-1 overflow-hidden gap-3">

            <div className={`h-full overflow-auto transition-all duration-300 ease-in-out ${
            isFiltersFullOpen ? 'w-3/12 opacity-100 visible' : 'w-0 opacity-0 invisible'
            }`}>
                <FiltersFull/>
            </div>

            <Map/>
            <div className='basis-4/12 overflow-y-auto'>
            <Listings/>
            </div>
        </div>
    </div>
  )
}

export default SearchPage