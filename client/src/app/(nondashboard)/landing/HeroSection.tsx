"use client"

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Input } from '@/components/input'
import { Button } from '@/components/button'

const HeroSection = () => {
  return (
    <div className='relative h-screen'>
        <Image 
        src = "/landing-splash.jpg"
        alt= "Rentiful Rental Platform Hero Section"
        fill
        className='object-cover object-center'
        priority
        />
        <div className='absolute inset-0 bg-black/60'>
            <motion.div 
            initial = {{ opacity: 0, y: 20 }}
            animate = {{ opacity: 1, y: 0 }}
            transition={{duration: 0.8}}
            className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center'>

                <div className='mx-auto max-w-4xl px-16 sm:px-12'>
                    <h1 className='text-4xl font-bold text-white mb-4'>
                        Start your journey to finding the perfect place to call home
                    </h1>
                    <p className = "text-xl text-white mb-8">
                        Explore our wide range of rental prpoerties tailored to fit your lifestyle and needs

                        <Input
                        type = "text"
                        value = "search query"
                        onChange={() => {}}
                        placeholder = "Search by city, neighborhood or address"
                        className='text-black w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12 mt-8'
                        
                        />
                    <Button
                    onClick = {() => {}}
                    className="bg-secondary-500 text-white rounded-none rounded-r-xl border-none hover:bg-secondary-600 h-12.5"
                    >Search</Button>
                    </p>
                </div>
            </motion.div>
        </div>

    </div>
  )
}

export default HeroSection