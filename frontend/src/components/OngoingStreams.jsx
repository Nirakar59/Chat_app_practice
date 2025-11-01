import React, { useEffect, useState } from 'react';
import { Play, Users, Eye, Radio, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const OngoingStreams = () => {
  const navigate = useNavigate();
  const { authUser, socket } = useAuthStore();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();

    const interval = setInterval(fetchStreams, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-stream', (streamData) => {
      // Don't show own streams
      if (streamData.hostId !== authUser._id) {
        fetchStreams();
      }
    });

    socket.on('stream-stopped', ({ streamId }) => {
      setStreams(prev => prev.filter(s => s._id !== streamId));
    });

    return () => {
      socket.off('new-stream');
      socket.off('stream-stopped');
    };
  }, [socket, authUser]);

  const fetchStreams = async () => {
    try {
      const res = await axiosInstance.get('/stream/public');
      setStreams(res.data.publicStreams);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching streams:', err);
      toast.error('Failed to load streams');
      setLoading(false);
    }
  };

  const handleStreamClick = (streamId) => {
    navigate(`/stream/${streamId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Video className="w-8 h-8" />
          Live Streams
        </h1>
        <button 
          onClick={() => navigate('/stream/start')}
          className="btn btn-primary gap-2"
        >
          <Play className="w-5 h-5" />
          Start Streaming
        </button>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-20">
          <Radio className="w-20 h-20 mx-auto mb-4 opacity-30" />
          <h3 className="text-2xl font-semibold opacity-70 mb-2">No live streams</h3>
          <p className="opacity-50 mb-6">Be the first to start streaming!</p>
          <button 
            onClick={() => navigate('/stream/start')}
            className="btn btn-primary gap-2"
          >
            <Play className="w-5 h-5" />
            Start Your Stream
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div
              key={stream._id}
              onClick={() => handleStreamClick(stream._id)}
              className="bg-base-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all hover:scale-105"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-black relative group">
                {stream.thumbnailUrl ? (
                  <img 
                    src={stream.thumbnailUrl} 
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <Video className="w-16 h-16 opacity-30" />
                  </div>
                )}
                
                {/* Live Badge */}
                <div className="absolute top-2 left-2 bg-error px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>

                {/* Viewer Count */}
                <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {stream.viewerCount || 0}
                </div>

                {/* Category Badge */}
                {stream.category && (
                  <div className="absolute bottom-2 left-2 bg-secondary/80 px-2 py-1 rounded text-xs">
                    {stream.category}
                  </div>
                )}

                {/* Play Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-1">{stream.title}</h3>
                
                {stream.description && (
                  <p className="text-sm opacity-70 mb-3 line-clamp-2">{stream.description}</p>
                )}

                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img 
                        src={stream.hostId.profilePic || '/avatar.png'} 
                        alt={stream.hostId.fullName}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {stream.hostId.fullName}
                    </p>
                    <p className="text-xs opacity-70">{stream.streamType}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OngoingStreams;