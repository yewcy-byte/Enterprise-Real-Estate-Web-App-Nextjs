"use server"

import React from 'react'
import {createBrowserClient} from "@supabase/ssr"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const apiKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY


if (!url || !apiKey){
    throw new Error ("no url or api key")
}
const supabase = createBrowserClient(url, apiKey)

export async function addToSupabase(formData: FormData) {
    const name = String(formData.get("name") ?? "")
    const message = String(formData.get("message") ?? "")

    const { error } = await supabase.from("guestBook").insert([
        { name, message },
    ])

    if (error) throw new Error("Cant insert data")

    revalidatePath('/playground/guestbook')
    redirect('/playground/guestbook')

}