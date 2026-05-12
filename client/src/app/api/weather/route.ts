import { NextResponse } from "next/server"


export async function GET(request: Request){

     const {searchParams} = new URL (request.url)
    const location = searchParams.get("location")

    const apiKey = process.env.WEATHER_API_KEY

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=${apiKey}`

   

    try{
            const res = await fetch (url)
    const data = await res.json()

if(!res.ok){
    throw new Error ("unable to fetch api url")
}
    return NextResponse.json(data)

    }catch  (err){
        const error = err instanceof Error? err : "unknown error"
        return NextResponse.json({error: error})
    }

    
    



}