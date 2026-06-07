'use client'

import { useState } from 'react'

export default function Home(){

const [question,setQuestion]=useState('')
const [answer,setAnswer]=useState('')

async function askAI(){

const response = await fetch(

'http://127.0.0.1:8000/ask?question='+question,

{
method:'POST'
})

const data = await response.json()

setAnswer(data.answer)

}

return(

<div className="p-10">

<h1 className="text-4xl font-bold">

Healthcare EDI Copilot

</h1>

<input

className="border p-3 mt-5 w-full"

placeholder="Ask EDI Question"

onChange={(e)=>
setQuestion(e.target.value)}

></input>

<button

className="bg-blue-500 text-white p-3 mt-5"

onClick={askAI}

>

ASK

</button>

<div className="mt-10">

<h2 className="font-bold">

Response

</h2>

<p>

{answer}

</p>

</div>

</div>

)

}