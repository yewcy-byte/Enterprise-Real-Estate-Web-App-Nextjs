import React, { useState } from 'react'

const Task2 = () => {

    const [input, setInput] = useState<string>("")
  
  const [item, addItem] = useState<string[]>([])

  const [toDelete, settoDelete] = useState<string>("")


  const handleAddItem = () => {
    if (input.trim() === "") return
    addItem([...item, input])
    setInput("")
  }

  const DeleteItem = (indexToDelete: string) => {
       const newList = item.filter((_, index) => {
        return index !== parseFloat(indexToDelete)
       })
       addItem(newList)
  }


  
    return (

    
    <div className='rounded-md shadow-md flex flex-col p-5 h-fit w-fit space-y-4'>
       
        <div className='space-x-3.5 space-y-2'>
             <h1 className='text-xl font-bold underline '>Add and Delete List</h1>
            <input type="text"
            placeholder='Add Item'
            className='w-64 p-4 bg-white border-2 border-black/40 rounded-md shadow-[10px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)]'
            value={input}
            onChange={(e) => {setInput(e.target.value)}} ></input>
              
              
              <input type="text"
            placeholder='Delete Item'
            className='w-64 p-4 bg-white border-2 border-red-300 rounded-md shadow-[10px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)]'
            value={toDelete}
            onChange={(e) => {settoDelete(e.target.value)}} ></input>
        </div>
         <div className='space-x-3'>
            <button className='w-20 rounded-full bg-green-200 p-3 cursor-pointer hover:shadow-md transition-all ' onClick={handleAddItem}>Add</button>

            <button className='w-20 rounded-full bg-red-200 p-3 cursor-pointer hover:shadow-md transition-all ' onClick={() => DeleteItem(toDelete)}>Delete</button>
        </div>
        <div className='space-y-2'>
            <h1>List Storage:</h1>
           
            {item.map((item, index) => {
                return(
                    <button onClick={() => settoDelete(String(index))}className=' grow transition-all flex shadow-md  justify-content p-2 bg-teal-100 hover:outline-green-400 hover:outline hover:cursor-pointer' key={index}>
                       <span className=''>{index + 1}.</span>
                       <span className=' grow text-center'>{item}</span>
 </button>
                )
                                    

            })}
           
        </div>
    </div>
  )
}

export default Task2