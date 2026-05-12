"use client"

import React, { useState } from 'react'

const page =  () => {

    type CountryDataObject = {
        flags :{ 
            png : string
        },
        name : {
            common : string
        }
    }

    const [country,setCountry] = useState("")
    const [error,setError] = useState("")
    const [result, setResult] = useState<CountryDataObject | null>(null)
    

const handleSearch = async (event: React.SubmitEvent<HTMLFormElement>) =>{
    event.preventDefault()

    try{
        const res = await fetch(`/api/country?name=${country}`)
    const data = await res.json(); 
    
    if (!res.ok){
        throw new Error ("Cant find country stated")
    }
    
    setResult(data)
    setError("")



    } catch(err){
            setError(err instanceof Error? err.message : "unknown error")
            setResult(null)
    }

}
    
  return (
    <div className='flex flex-col justify-center items-center p-10'>

        <div className='space-x-10'>

            <form onSubmit={handleSearch}>
<input type="text"
        className='h-10 w-100 p-5'
        placeholder='What country are you thinking of?'
        value={country}
        onChange={(e) =>setCountry(e.target.value)}
         />
                 <button className='w-20 rounded-full bg-green-200 p-3 cursor-pointer hover:shadow-md transition-all ' type='submit'>Search</button>

     

            </form>

        

        </div>
       

        <div>
            {error &&(
                <h1 className='text-red-400'>{error}</h1>
            )}

            {result?.flags.png && (
                <div>
 <h1>{result.name.common}</h1>
                <img src={result?.flags.png} alt="flag Image" className='' />


                </div>
               
            )}
            
        </div>

    </div>
  )
}

export default page