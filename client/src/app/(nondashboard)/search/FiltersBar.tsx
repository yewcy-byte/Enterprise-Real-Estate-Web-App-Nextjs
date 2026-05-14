"use client";

import React from 'react'
import { useDispatch } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/state/redux';
import { useState } from 'react';
import { FilterState, setFilters, setViewMode, toggleFiltersFullOpen } from '@/state';
import { cleanParams, cn, formatPriceValue } from '@/lib/utils';
import { Button } from '@/components/button';
import { Filter, Grid, List, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { Input } from '@/components/input';
import { PropertyTypeIcons } from '@/lib/constants';

const debounce = <T extends (...args: any[]) => void>(fn: T, wait = 300) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    };
};

const FiltersBar = () => {

    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const filters = useAppSelector((state) => state.global.filters);
    
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);

    const viewMode = useAppSelector((state) => state.global.viewMode);
    const [searchInput, setSearchInput] = useState(filters.location);

    const updateURL = debounce((newFilters:FilterState) => {
        const cleanFilters = cleanParams(newFilters);
        const updatedSearchParams = new URLSearchParams();
        Object.entries(cleanFilters).forEach(([key, value]) => {
         updatedSearchParams.set(
            key,
            Array.isArray(value) ? value.join(",") : value.toString()
         )
    });
        router.push(`${pathname}?${updatedSearchParams.toString()}`); 

    })
    
    const handleFilterChange = (
        key:string,
        value: any,
        isMin: boolean | null
    ) => {
        let newValue = value;

        if (key === "priceRange" || key === "squareFeet") {
            const currentArrayRange = [...(filters[key] as [number | null, number | null])]
            if (isMin !== null) {
               const index = isMin ? 0 : 1;
               currentArrayRange[index] = value ==="any" ? null : Number(value);
            }
            newValue = currentArrayRange

        }else if (key === "coordinates"){
            newValue = value === "any" ? [0, 0] : value.map(Number)


        } else{
            newValue = value === "any" ? "any" : value;
        }

        const newFilters = {
            ...filters,
            [key]: newValue,
        } as unknown as FilterState;

        dispatch(setFilters(newFilters));
        updateURL(newFilters);
    };


        const handleLocationSearch = async () => {
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&fuzzyMatch=true`
                );
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center;
                    const newFilters = {
                        ...filters,
                        location: searchInput || "any",
                        coordinates: [lng, lat],
                    } as FilterState;

                    dispatch(setFilters(newFilters));
                    updateURL(newFilters);
                }
            } catch (error) {
                console.error("Error fetching geocoding data:", error);
            }
        }

    return (
        <div className='flex  w-full py-5 mr-auto space-x-2'>
            {/*Filters*/}
            <Button
            variant = "outline"
            className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100 ",
                    isFiltersFullOpen && "bg-primary-700 text-primary-100"
        )}
        onClick={() => dispatch(toggleFiltersFullOpen())}
            >
                <Filter className="w-4 h-4 "/>
                <span>All Filters</span>
            </Button>

            {/*Search Location*/}
            <div className="flex items-center">
                <Input
                    placeholder="Search location"
                    className="p-1 w-40 rounded-l-xl rounded-r-none border-primary-400 border-r-0 "
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />

                <Button onClick={handleLocationSearch} 
                className="rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none border hover:bg-primary-700 hover:text-primary-50 ">
                    <Search className="w-4 h-4" />
                </Button>
            </div>

            {/*Price range*/}
            <div className='flex gap-1'>
                <Select
                value={filters.priceRange[0] === null ? "any" : String(filters.priceRange[0])}
                onValueChange={(value) => handleFilterChange("priceRange", value, true)}
                >
                    <SelectTrigger className="w-32 rounded-xl border-primary-400 hover:bg-primary-700 hover:text-primary-100 hover:cursor-pointer ">
                        <SelectValue>
                        {formatPriceValue(filters.priceRange[0], true)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Min Price</SelectItem>

                    {[500, 1000, 1500, 2000, 3000,5000,10000].map((price) => (
                        <SelectItem key={price} value={price.toString()}>
                            ${price/1000}k+
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>

            </div>

             <div className='flex gap-1'>
                <Select
                value={filters.priceRange[1] === null ? "any" : String(filters.priceRange[1])}
                onValueChange={(value) => handleFilterChange("priceRange", value, false)}
                >
                    <SelectTrigger className="w-32 rounded-xl border-primary-400 hover:bg-primary-700 hover:text-primary-100 hover:cursor-pointer ">
                        <SelectValue>
                        {formatPriceValue(filters.priceRange[1], false)}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Max Price</SelectItem>

                    {[1000, 2000, 3000, 5000, 10000].map((price) => (
                        <SelectItem key={price} value={price.toString()}>
                            ${price/1000}k+
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>

            </div>

             {/*Beds and Baths*/}
            <div className='flex gap-1'>
                {/*Beds*/}
                <Select
                value={filters.beds === "any" ? "Any Beds" : String(filters.beds)}
                onValueChange={(value) => handleFilterChange("beds", value, null)}
                >
                    <SelectTrigger className="w-32 rounded-xl border-primary-400 hover:bg-primary-700 hover:text-primary-100 hover:cursor-pointer ">
                        <SelectValue placeholder="Beds"/>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Beds</SelectItem>
                        <SelectItem value="1">1+ Bed</SelectItem>
                        <SelectItem value="2">2+ Beds</SelectItem>
                        <SelectItem value="3">3+ Beds</SelectItem>
                    </SelectContent>
                </Select>

                {/*Baths*/}

                  <Select
                                value={filters.baths === "any" ? "Any Baths" : String(filters.baths)}
                onValueChange={(value) => handleFilterChange("baths", value, null)}
                >
                    <SelectTrigger className="w-32 rounded-xl border-primary-400 hover:bg-primary-700 hover:text-primary-100 hover:cursor-pointer ">
                        <SelectValue placeholder="Baths"/>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Baths</SelectItem>
                        <SelectItem value="1">1+ Bath</SelectItem>
                        <SelectItem value="2">2+ Baths</SelectItem>
                        <SelectItem value="3">3+ Baths</SelectItem>
                        <SelectItem value="4">4+ Baths</SelectItem>
                    </SelectContent>
                </Select> 
                
                {/*Property Type*/}

                  <Select
                                value={filters.propertyType === "any" ? "Any Type" : String(filters.propertyType)}
                onValueChange={(value) => handleFilterChange("propertyType", value, null)}
                >
                    <SelectTrigger className="w-32 rounded-xl border-primary-400 hover:bg-primary-700 hover:text-primary-100 hover:cursor-pointer ">
                        <SelectValue placeholder="Home Type"/>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="any">Any Property Type</SelectItem>
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <SelectItem key={type} value={type}>
                                <div className="flex items-center">
                                    <Icon className='w-4 h-4 mr-2' />
                                    <span>{type}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

            </div>

            {/*View Mode*/ }

                            <div className='flex ml-auto'>


                            <div className='flex border rounded-xl'>

                                <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
                                    viewMode === "list"? "bg-primary-700 text-primary-50" : ""
                                )}
                                onClick={() => dispatch(setViewMode("list"))}
                            >
                                
                                <List className='w-5 h-5'/>
                            </Button>
                                     <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
                                    viewMode === "grid"? "bg-primary-700 text-primary-50" : ""
                                )}
                                onClick={() => dispatch(setViewMode("grid"))}
                            >
                                
                                <Grid className='w-5 h-5'/>
                            </Button>
                            </div>
            </div>

            </div>

   
       
    )
}

export default FiltersBar