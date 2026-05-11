"use client"

import React, { useState } from 'react'
import Task2 from './components/task2';
import Task3 from './components/task3';

const page = () => {

    const [inputValue, setInputValue] = useState("");
    const [pressed, setPressed] = useState(false)
    const [submitValue , setSubmitValue] = useState("");

    const handleOnClick = () => {
        setSubmitValue(inputValue)
        setInputValue("")
        setPressed(!pressed)
    }
  return (
<div className='flex flex-col justify-center items-center p-6 space-y-5'>
        <div className={`${pressed? "bg-green-100" : "bg-red-100"} hover:shadow-md transition-all rounded-md  flex flex-col justify-center items-center space-y-3 w-fit`}>
                 <input 
                 className='text-xl h-10 m-3 p-3 border-2 rounded-4xl'
                 type="text" 
                 placeholder='enter your name'
                 value={inputValue}
                 onChange={(e) => setInputValue(e.target.value) } ></input>  
                 <div>
                    <button onClick={handleOnClick} className='shadow-md bg-blue-400 p-3 hover:bg-blue-100 hover:text-blue-800 transition-all cursor-pointer rounded-full text-2xl font-bold'>Submit</button>
                 </div>
<div className=''>
    hi {submitValue} 
</div>    

<div>
    <h1>{pressed? "pressed" : "unpressed"}</h1>
</div>

        </div>
        
    <Task2 />

    <Task3/>



    </div>
        
)
}

export default page