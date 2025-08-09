import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { v4 as uuid } from "uuid";

function Home() {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const generateRoomId = (e) => {
        e.preventDefault();
        const id = uuid();
        setRoomId(id);
        toast.success("Room is ready!");
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error("Incomplete details");
            return;
        }
        navigate(`/editor/${roomId}`, {
            state: { username }
        });
        toast("you've joined the room");
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <img 
                src="/bg.jpg" 
                alt="background"
                className="absolute inset-0 w-full h-full object-cover -z-10"
            />
            <div className="flex justify-center items-center h-screen">
                <div className="w-full md:w-1/2">
                    <div className="shadow-[0_20px_300px_rgba(0,0,0,1)] border-[rgb(200,255,200)]/40 p-2 mb-5 bg-[rgb(22,22,22)] rounded-3xl">
                        <img 
                            className="mt-5 mx-auto block max-w-[100px] w-full" 
                            src="/logo.svg" 
                            alt="Logo" 
                        />
                        <div className="text-green-200 font-mono flex flex-col items-center mt-2 font-extrabold text-2xl">
                            codemix
                        </div>
                        <br />
                        <div className="gap-y-4 flex flex-col items-center">
                            <input 
                                type="text" 
                                className="w-3/4 rounded-3xl mb-2 p-3 pl-6 border border-slate-400 shadow-sm bg-black font-mono text-slate-500 font-extrabold" 
                                placeholder="Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)} 
                            />
                            <input 
                                type="text" 
                                className="w-3/4 rounded-3xl mb-2 p-3 pl-6 border border-slate-400 shadow-sm bg-[rgb(200,255,200)] font-mono text-slate-500 font-extrabold" 
                                placeholder="Username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                            <button className="flex flex-col items-center mb-2 bg-[rgb(255,255,150)] hover:bg-[rgb(200,255,200)] px-20 py-3 rounded-full font-extrabold font-sans text-lg"
                                    onClick={joinRoom}
                            >
                                JOIN
                            </button>
                            <div className="flex items-center gap-x-2 mb-10 text-sm">
                                <p className="font-light text-slate-100">Don't have an ID?</p>
                                <button className="font-md text-[rgb(200,255,200)] hover:text-[rgb(200,200,200)]"
                                        onClick={generateRoomId}
                                >
                                    Create room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;