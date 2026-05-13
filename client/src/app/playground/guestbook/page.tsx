import React from 'react'
import {createClient} from "@supabase/supabase-js"
import { addToSupabase } from '../actions'


const page = async () => {

    
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

        if (!url || !apiKey) {
          throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
        }

        const supabase = createClient(url, apiKey)

    const {data : allguestBooks} = await supabase.from("guestBook").select("*").order("id",{ascending: false})
  return (


      <div className='rounded-md shadow-md flex flex-col p-5 h-fit w-fit space-y-4 justify-items items-center'>
       
      
             <h1 className='text-xl font-bold underline '>Supabase Adding and Fetching</h1>

             <form action={addToSupabase} className='flex flex-col space-y-10 p-10'>
                
                  <input type="text"
            placeholder='Enter your name'
            className='w-64 p-4 bg-white border-2 border-black/40 rounded-md shadow-[10px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)]'
           name='name'
          ></input>

            <textarea name="message"placeholder="Enter you message" className='border-2'  />
                    <button className='w-50 rounded-full bg-green-200 p-3 cursor-pointer hover:shadow-md transition-all ' type='submit'>Add to Supabase</button>

             </form>
          
 

    <div className='rounded-md shadow-md flex flex-col p-5 h-fit w-fit space-y-4'>

        {allguestBooks?.map((guest) => {

            return (
                <div key={guest.id} className='shadow-md m-3'>
                    <h1><span>Name:</span><span>{guest.name}</span></h1>
                    <h1><span>Message:</span><span>{guest.message}</span></h1>

                </div>
            )

        })}
        
    </div>
  </div>
  )
}

export default page