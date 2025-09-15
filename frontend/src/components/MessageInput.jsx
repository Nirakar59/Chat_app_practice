import React, { useRef, useState } from 'react'
import { useMessageStore } from '../store/useMessageStore'
import {Image, X, Send} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGuildMessageStore } from '../store/useGuildMessageStore'
import { useGuildStore } from '../store/useGuildStore'

const MessageInput = ({page}) => {

  const [text, setText] = useState("")
  const[imagePreview, setImagePreview] = useState(null)
  const fileINputRef = useRef(null)
  const{sendMessage} = useMessageStore()
  const { sendMessageToGuild } = useGuildMessageStore()
  const {selectedGuild} = useGuildStore()

  const handleSubmit = async(e)=>{
    e.preventDefault()

    if(!text.trim() && !imagePreview){
      return;
    }

    try {
      page === "Guild"? (
        await sendMessageToGuild(
          selectedGuild._id,{
            text: text.trim(),
            img: imagePreview
          }
        )
      ):(
        await sendMessage({
          text: text.trim(),
          image: imagePreview
        })
      )
      

      setText("")
      setImagePreview(null)
      if(fileINputRef.current) fileINputRef.current.value=""
      
    } catch (error) {
      toast.error("Failed to send message", error)
    }
  }

  const handleInputPreview = (e) =>{
    const file = e.target.files[0]
    if(!file.type.startsWith("image/")){
      toast.error("Please input an Image file")
    return;
}
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = ()=>{
    setImagePreview(null)
    if(fileINputRef.current) fileINputRef.current.value="";
  }


  return (
    <div className='p-4 w-full'>
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <div className="flex flex-1 gap-2">
          <input
           type="text"
           className="w-full input input-bordered rounded-lg input-sm sm:input-md"
           placeholder='Type a message!!'
           value={text}
           onChange={(e)=>setText(e.target.value)}
          />

          <input
           type="file"
           accept='image/*'
           className='hidden'
           ref={fileINputRef}
           onChange={handleInputPreview} 
          />

          <button
           type='button'
           className={`hidden sm:flex btn btn-circle
              ${imagePreview? "text-emerald-500" : "text-zinc-400"} `}
           onClick={()=> fileINputRef.current?.click()}   
          >
            <Image size={20}/>
          </button>
          </div>

          <button
           type="submit"
           className='btn btn-sm btn-circle'
           disabled={!text.trim() && !imagePreview}
          >
            <Send size={22}/>
          </button>
      </form>
    </div>
  )
}

export default MessageInput