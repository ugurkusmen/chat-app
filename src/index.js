const express = require('express')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const path = require('path')
const http=require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')

const app = express()
const server= http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))
//let count = 0
io.on('connection',(socket)=>{

    console.log('New WebSocket connection')
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('admin','Welcome'))

        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()



    })
   
    socket.on('newmessage',(value,callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(value)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',generateMessage(user.username,value))
        callback()
    })



    socket.on('sendLocation',(location,callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.lat},${location.long}`))
        callback('location has beed send')
    })

    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>{
    //     count++
    //     //socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })   
        }
        
    })
})




server.listen(port,()=>{
    console.log('server is up on port '+ port)
})