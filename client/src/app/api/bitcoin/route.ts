import { NextResponse } from "next/server"


export async function GET (){
const api = process.env.COINGECKO_API_KEY
const url = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=${api}`

try{
const response = await fetch (url, {cache:  "no-store"})

if (!response.ok){
    throw new Error ("cant fetch url")
}

const data = await response.json()
return NextResponse.json({price : data.bitcoin.usd})
} catch (error){
    const message = error instanceof Error?error.message : String(error)
return NextResponse.json({error: message })
}


}


