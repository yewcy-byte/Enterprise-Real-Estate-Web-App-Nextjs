import { NextResponse } from "next/server"


export async function GET(request: Request){
    const {searchParams} = new URL(request.url)
    const country = searchParams.get("name")
const url = `https://restcountries.com/v3.1/name/${country}`

    try{
        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok){
            throw new Error ("API problem")
        }

        return NextResponse.json(data[0])

    }catch(error){
return NextResponse.json({error:"country not found"}, { status: 500 })
    }
}