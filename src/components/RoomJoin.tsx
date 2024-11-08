import React, { useState } from 'react';
import { KeyRound, Plus } from 'lucide-react';

interface RoomJoinProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: () => void;
}

export function RoomJoin({ onJoinRoom, onCreateRoom }: RoomJoinProps) {
  const [roomId, setRoomId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      onJoinRoom(roomId.trim());
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white/30 backdrop-blur-sm rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Join a Chat Room
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
            Room Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room code"
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/50 border-0 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          Join Room
        </button>
      </form>

      <div className="mt-4 text-center">
        <span className="text-gray-500">or</span>
      </div>

      <button
        onClick={onCreateRoom}
        className="mt-4 w-full py-2 px-4 rounded-lg border-2 border-indigo-500 text-indigo-500 font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create New Room
      </button>
    </div>
  );
}