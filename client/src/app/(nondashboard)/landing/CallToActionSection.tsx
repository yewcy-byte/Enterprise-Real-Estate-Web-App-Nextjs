"use client"

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

const CallToActionSection = () => {
  return (
    <div className='relative py-24'>
        <Image
        src = "/landing-call-to-action.jpg"
        alt= "Rentiful Search Section Background"
        fill
        className= "object-cover object-center" />
        <div className='absolute inset-0 bg-black bg-opacity-60'></div>
        <motion.div
        initial = {{ opacity: 0, y: 20 }}
        >
    </div>
  )
}

export default CallToActionSection