"use client"

import { useEffect, useState } from "react"
import { io as ClientIO } from "socket.io-client"

export const useSocket = () => {
    const [socket, setSocket] = useState<any>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const socketInstance = new (ClientIO as any)(process.env.NEXT_PUBLIC_SITE_URL || '', {
            path: '/api/socket',
            addTrailingSlash: false,
        })

        socketInstance.on('connect', () => {
            console.log('Connected to socket')
            setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from socket')
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    return { socket, isConnected }
}
