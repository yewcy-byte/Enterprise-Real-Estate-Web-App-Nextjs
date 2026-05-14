"use client"

import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/state/redux';
import  {initialState, setFilters} from "@/state"
// types/imports removed to avoid extra deps in this small component
import { cleanParams, cn } from '@/lib/utils';
import { Input } from '@/components/input';
import { Search } from 'lucide-react';
import { Button } from '@/components/button';
import { PropertyTypeIcons } from '@/lib/constants';
import { Slider } from '@/components/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/select';
import { AmenityIcons, AmenityEnum } from '@/lib/constants';
import { Label } from '@/components/label';
import { formatEnumString } from '@/lib/utils';
import { TelemetryPlugin } from 'next/dist/build/webpack/plugins/telemetry-plugin/telemetry-plugin';

const FiltersFull = () => {


  const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const filters = useAppSelector((state) => state.global.filters);

    const [localFilters,setLocalFilters] = useState<any>(initialState.filters);
    const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);



    // lightweight debounce to avoid lodash/@types dependency
    const debounce = (fn: (...args: any[]) => void, wait = 300) => {
        let t: ReturnType<typeof setTimeout> | null = null;
        return (...args: any[]) => {
            if (t) clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    };

    const updateURL = debounce((newFilters: any) => {
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

    const handleSubmit = () => {
        dispatch(setFilters(localFilters as any));
        updateURL(localFilters as any);
    }

    const handleReset = () => {
        setLocalFilters(initialState.filters);
        dispatch(setFilters(initialState.filters as any));
        updateURL(initialState.filters as any);
    }

    const handleAmenityChange = (amenity: AmenityEnum) => {
      setLocalFilters((prev: any) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter((item: AmenityEnum) => item !== amenity)
          : [...prev.amenities, amenity],
      }));
    }

    const handleLocationSearch = async () => {
      try{

      
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(localFilters.location)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&fuzzyMatch=true`);
      const data = await response.json();
      if (data.features && data.features.length > 0){
        const [lng,lat] = data.features[0].center;
        const updatedFilters = {
          ...localFilters,
          coordinates: [lng, lat]
        };
        setLocalFilters(updatedFilters);
        dispatch(setFilters(updatedFilters as any));
        updateURL(updatedFilters as any);
      } else {
        handleSubmit();
      }
    }
  catch (error){
    console.error("Error fetching geocoding data:", error);
  }
}

    if (!isFiltersFullOpen){
        return null;
    }

  return (
    <div
    className='bg-white rounded-lg px-4 h-full overflow-auto -pb-10'>
        <div className='flex flex-col space-y-6'>
        {/* Location*/}
            <div>
                <h4 className='font-bold mb-2'>Location</h4>
                <div className='flex items-center'>
                    <Input placeholder='Enter location'
                    value={localFilters.location}
                    onChange={(e) => setLocalFilters((prev: any) => ({ ...prev, location: e.target.value } as any))}
                    className='rounded-l-xl rounded-r-none border-r-0'
                    />
                    <Button onClick={handleLocationSearch}
                    className='rounded-r-xl rounded-l-none border-black shadow-none border'>
                        <Search className='w-4 h-4'></Search>
                    </Button>
                </div>
            </div>

            {/* Property Type */}
            <div>
                <h4 className='font-bold mb-2'>Property Type</h4>
                <div className='grid grid-cols-2 gap-4'>
                    {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                        <div
                        key={type}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 border rounded-xl",
                            localFilters.propertyType === type ? "border-black" : "border-gray-300"
                        )}
                        onClick={() =>setLocalFilters((prev: any) =>({
                            ...prev,
                            propertyType: type as any
                        } as any))}>

                            <Icon className='w-6 h-6 mb-2'/>
                            <span>{type}</span>

                        </div>
                    ))}
                </div>
            </div>
         {/* Price Range */}
        <div>
          <h4 className="font-bold mb-2">Price Range (Monthly)</h4>
          <Slider
            min={0}
            max={10000}
            step={100}
            value={[
              localFilters.priceRange[0] ?? 0,
              localFilters.priceRange[1] ?? 10000,
            ]}
            onValueChange={(value: any) =>
              setLocalFilters((prev: any) => ({
                ...prev,
                priceRange: value as [number, number],
              } as any))
            }
          />
          <div className="flex justify-between mt-2">
            <span>${localFilters.priceRange[0] ?? 0}</span>
            <span>${localFilters.priceRange[1] ?? 10000}</span>
          </div>
        </div>

          {/* Beds and Baths */}
        <div className="flex gap-4">
          <div className="flex-1">
            <h4 className="font-bold mb-2">Beds</h4>
            <Select
              value={localFilters.beds || "any"}
              onValueChange={(value) =>
                setLocalFilters((prev: any) => ({ ...prev, beds: value } as any))
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any beds</SelectItem>
                <SelectItem value="1">1+ bed</SelectItem>
                <SelectItem value="2">2+ beds</SelectItem>
                <SelectItem value="3">3+ beds</SelectItem>
                <SelectItem value="4">4+ beds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <h4 className="font-bold mb-2">Baths</h4>
            <Select
              value={localFilters.baths || "any"}
              onValueChange={(value) =>
                setLocalFilters((prev: any) => ({ ...prev, baths: value } as any))
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Baths" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any baths</SelectItem>
                <SelectItem value="1">1+ bath</SelectItem>
                <SelectItem value="2">2+ baths</SelectItem>
                <SelectItem value="3">3+ baths</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Square Feet */}
        <div>
          <h4 className="font-bold mb-2">Square Feet</h4>
          <Slider
            min={0}
            max={5000}
            step={100}
            value={[
              localFilters.squareFeet[0] ?? 0,
              localFilters.squareFeet[1] ?? 5000,
            ]}
            onValueChange={(value) =>
              setLocalFilters((prev: any) => ({
                ...prev,
                squareFeet: value as [number, number],
              } as any))
            }
            className="[&>.bar]:bg-primary-700"
          />
          <div className="flex justify-between mt-2">
            <span>{localFilters.squareFeet[0] ?? 0} sq ft</span>
            <span>{localFilters.squareFeet[1] ?? 5000} sq ft</span>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h4 className="font-bold mb-2">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
              <div
                key={amenity}
                className={cn(
                  "flex items-center space-x-2 p-2 border rounded-lg hover:cursor-pointer",
                  localFilters.amenities.includes(amenity as AmenityEnum)
                    ? "border-black"
                    : "border-gray-200"
                )}
                onClick={() => handleAmenityChange(amenity as AmenityEnum)}
              >
                <Icon className="w-5 h-5 hover:cursor-pointer" />
                <Label className="hover:cursor-pointer">
                  {formatEnumString(amenity)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Available From */}
        <div>
          <h4 className="font-bold mb-2">Available From</h4>
          <Input
            type="date"
            value={
              localFilters.availableFrom !== "any"
                ? localFilters.availableFrom
                : ""
            }
            onChange={(e) =>
              setLocalFilters((prev: any) => ({
                ...prev,
                availableFrom: e.target.value ? e.target.value : "any",
              } as any))
            }
            className="rounded-xl"
          />
        </div>
 {/* Apply and Reset buttons */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary-700 text-white rounded-xl"
          >
            APPLY
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Reset Filters
          </Button>
        </div>



        </div>
    </div>
  )
}

export default FiltersFull