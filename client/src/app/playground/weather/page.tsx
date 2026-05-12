"use client"

import React, { useState } from 'react'



const page = () => {

    type WeatherObject={
        weather:{
            id: number
            description: string
            icon: string
        }[]
        main :{
         temp: number   
        }
       
    }

    const [input, setInput] = useState("")
    const [weather, setWeather] = useState<WeatherObject | null>(null)
    const [error, setError] = useState("")

    const handleSubmit = async (event : React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        
        try {
                const res = await fetch (`/api/weather?location=${input}`)
                const data = await res.json()

                if(!res.ok){
                    throw new Error ("cant find city!")
                }
                setWeather(data)

             

        } catch (error){
            setError("wrong input")
        }

    }

  return (
    <div className='flex flex-col justify-center items-center p-10'>
        <form onSubmit={handleSubmit}>
            <input type="text" value={input} className='h-8 p-5' onChange={(e)=> setInput(e.target.value)} placeholder='What city you want?'/>
       <button className='w-20 rounded-full bg-green-200 p-3 cursor-pointer hover:shadow-md transition-all ' type='submit'>Check Weather</button>

        </form>

        <h1>Current Temperature: {weather?.main?.temp}</h1>
        <h1>weather description:{weather?.weather?.[0]?.description}</h1> 
        <img src={`https://openweathermap.org/img/wn/${weather?.weather?.[0]?.icon}@4x.png`} alt="" />
        {error && (
            <h1 className='text-red-500'>{error}</h1>
        )}

    </div>
  )
}

export default page