import React, { useEffect, useRef, useState } from 'react'
import Client from './cascade/client'
import Console from './cascade/console'
import { initSocket } from '../connection/socket';
import {
    Navigate, 
    useLocation, 
    useNavigate, 
    useParams 
} from 'react-router-dom';
import toast from 'react-hot-toast';


function Editor() {
    
    const [clients, setClients] = useState([]);

    const codeRef = useRef(null);
    const socketRef = useRef(null);
    const location = useLocation();
    const {roomId} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {

            socketRef.current = await initSocket();
            
            const handleError = () => {
                console.error("socket error");
                toast.error("Socket connection failed")
                navigate("/");
            }
            
            socketRef.current.on('connect_error', (err) => handleError(err))
            socketRef.current.on('connect_timeout', (err) => handleError(err))

            //join room
            socketRef.current.emit('join',{
                roomId, 
                username : location.state?.username || "Anonymous"
            })
            socketRef.current.on('joined', ({clients, username, socketId}) => {
                if(username !== location.state?.username){
                    toast(`${username} has joined the room`);
                }
                setClients(clients);
                socketRef.current.emit('sync-code', {
                    code : codeRef.current,
                    socketId,
                })
                
            })


                //disconnection
                socketRef.current.on('disconnected', ({socketId, username})=>{
                    toast(`${username} left the room`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        )
                    })
                })
        }
        init();
        
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off('joined');
            socketRef.current.off('disconnected');
        };
    }, [roomId, location.state?.username, navigate]);

    // Prevent rendering if user entered URL directly
    if(!location.state){
        return <Navigate to="/"/>
    }


  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background image */}
        <img 
            src="/bg.jpg" 
            alt="background"
            className="absolute inset-0 w-full h-full object-cover -z-10"
        />
    <div className="w-full h-screen flex">

        {/* sidebar */}
        <div className="w-1/6 ml-6 mt-6 text-white flex flex-col h-full/2 justify-center">
        {/* Sidebar content container */}
        <div className="flex flex-col bg-[rgb(22,22,22)] mx-0 border-4 border-[rgb(200,255,200)]/0 rounded-3xl h-full w-auto mb-7 p-2">
          
        <div className='h-[50px] w-full flex items-center justify-center shadow-md shadow-black rounded-xl'>
            <p className='size-md font-mono '>codemix</p>
        </div>


            {/* Client list container */}
            <div className="flex-1 flex flex-col overflow-auto py-4 items-center text-white ">
                {clients.map((client) => (
                    <Client key={client.socketId} username={client.username} />
                ))}
            </div>

            {/* Buttons at bottom */}
            <hr />
            <div className="flex justify-around mt-4 mb-2 gap-x-2">
            <button className="w-full shadow-md shadow-black bg-blue-300 hover:bg-amber-200 text-black px-4 py-2 ml-1 rounded-l-xl font-mono text-sm">
                <p>Copy link</p>
            </button>
            <button className="w-full shadow-md shadow-black bg-red-500 hover:bg-amber-200 text-black px-4 py-2 mr-1 rounded-r-xl font-mono text-sm">
                Leave
            </button>
            </div>
        </div>


        </div>
        {/* editor */}
            <div className="w-5/6 text-white flex flex-col h-full p-4">
                <div className='flex shadow-[0_20px_30px_rgba(0,0,0,1)] bg-[rgb(12,12,12)]/80 m-2 border-4 border-[rgb(200,255,200)]/40 rounded-3xl h-full w-auto'>
                    <Console 
                        socketRef={socketRef}
                        roomId={roomId}
                        onCodeChange={(code) => {
                            // console.log(code);
                            codeRef.current = code;
                        }}
                    />
                </div>
            </div>

        </div>
    </div>
  )
}

export default Editor