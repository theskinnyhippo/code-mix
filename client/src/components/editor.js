import React, { useEffect, useRef, useState } from 'react'
import Client from './cascade/client'
import Console from './cascade/console'
import { initSocket } from '../connection/socket';
import {
    // Navigate, 
    useLocation, 
    useNavigate, 
    useParams 
} from 'react-router-dom';
import toast from 'react-hot-toast';


function Editor() {
    
    const [clients, setClients] = useState([]);

    const codeRef = useRef("");
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
                
                // socketRef.current.emit('sync-code', {
                //     code : codeRef.current,
                //     socketId,
                // })
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
    }, []);

    // Prevent rendering if user entered URL directly
    if(!location.state || !location.state.username) {
        toast.error("Username is required to join the room");
        navigate('/');
    }


    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('RoomID is copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy Room ID');
        }
    }

    const leave = () => {
        socketRef.current.emit('leave', { roomId });
        navigate('/');
            toast.success('You have left the room');
    }

    const [language, setLanguage] = useState("c++");


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
            <div className="flex justify-around mt-2 mb-0 mx-0">
                <button
                className="w-1/2 mx-2 bg-[radial-gradient(at_50%_5%,_theme(colors.teal.500),_theme(colors.black))] hover:bg-[radial-gradient(at_50%_55%,_theme(colors.teal.900),_theme(colors.black))] shadow-md shadow-black hover:shadow-gray-700 text-white hover:text-gray-400 font-bold px-4 py-2 rounded-full font-sans text-sm hover:text-xs"
                onClick={copyRoomId}
                >
                    <p>Link</p>
                </button>
                <button
                className="w-1/2 mx-2 bg-[radial-gradient(at_50%_5%,_theme(colors.red.600),_theme(colors.black))] hover:bg-[radial-gradient(at_50%_55%,_theme(colors.red.900),_theme(colors.black))] shadow-md shadow-black hover:shadow-gray-700 text-white hover:text-gray-400 font-bold px-4 py-2 rounded-full font-sans text-sm hover:text-xs"
                onClick={leave}
                >
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
                        onCodeChange={(code) => (codeRef.current = code)}    
                        language={language}
                        setLanguage={setLanguage}                
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Editor