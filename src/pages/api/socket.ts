import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/next'

export const config = {
    api: {
        bodyParser: false,
    },
}

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        console.log('New Socket.io server...')
        const httpServer: NetServer = res.socket.server as any
        const io = new ServerIO(httpServer, {
            path: '/api/socket',
            addTrailingSlash: false,
        })

        io.on('connection', (socket) => {
            console.log('Socket connected:', socket.id)

            socket.on('join-room', (roomId) => {
                socket.join(roomId)
                console.log(`Socket ${socket.id} joined room ${roomId}`)
            })

            socket.on('send-message', (data) => {
                // data: { roomId, message, user }
                io.to(data.roomId).emit('new-message', data)
            })
        })

        res.socket.server.io = io
    }
    res.end()
}

export default socketHandler
