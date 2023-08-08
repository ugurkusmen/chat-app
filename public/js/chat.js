const socket = io()




//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')



const {username,room} =  Qs.parse(location.search,{ignoreQueryPrefix:true})

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have I scrolled ?
    const scrollOffset =$messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight<= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message)=>{
    console.log(message)
    const html =Mustache.render(messageTemplate,{username:message.username,message:message.text,createdAt:moment(message.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(location)=>{
    const html = Mustache.render(locationTemplate,{username:location.username,location:location.text,createdAt:moment(location.createdAt).format('h:mm a')})
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{room,users})
    document.querySelector('#sidebar').innerHTML = html
})

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const value = e.target.elements.message.value
    socket.emit('newmessage',value,(error)=>{
        if(error){
            $messageFormButton.removeAttribute('disabled')
            return console.log(error)
            
            
        }
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        
    })
    
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $locationButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{lat:position.coords.latitude,long:position.coords.longitude},(callback)=>{
            console.log(callback)
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
   

})

