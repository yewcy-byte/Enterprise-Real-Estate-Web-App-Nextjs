import React, { useState, useEffect } from 'react'

const task3 = () => {

type BitcoinObject = {
    price : string
    error? : string
}

const [loading,setLoading] = useState(false)
const [price, setPrice] = useState("")
const [error, setError] = useState("")

const newPrice = async () => {
setLoading(true)

try{
const res = await fetch("/api/bitcoin")
const data = (await res.json()) as BitcoinObject

if (!res.ok){
    throw new Error(data.error || "unable to fetch api")
}

setPrice(data.price)
} catch (error){
setError(error instanceof Error? error.message : "unable to fetch coingecko api" )
}finally{
    setLoading(false)
}
}

useEffect(() => {
newPrice()
},[])

  return (
    <div className='items-center rounded-md shadow-md flex flex-col p-5 h-fit w-screen space-y-4 m-3'>
        <h1 className='font-bold text-xl underline mr-auto'>BitCoin Price Fetcher</h1>
    <button className='bg-amber-200 p-2 rounded-full w-80 cursor-pointer hover:bg-amber-300 transition-all'
    onClick={newPrice}
    >{loading? "Loading..." : "Fetch Live Price"}</button>
    <h1>Current BitCoin Price</h1>
    <h1>{error? error : price}</h1>

    </div>
  )
}

export default task3