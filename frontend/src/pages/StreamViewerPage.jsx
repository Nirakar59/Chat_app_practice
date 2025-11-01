import Hls from 'hls.js';
import { ArrowLeft, Eye, Radio, Send, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';

const StreamViewerPage = () => {
  const navigate = useNavigate();
  const { streamId } = useParams();
  const { authUser, socket } = useAuthStore();

  const [stream, setStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchStreamData();

    return () => {
      leaveStream();
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamId]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !stream) return;

    // Join stream room
    socket.emit('join-stream-room', { roomId: stream.roomId });

    socket.on('viewer-joined', ({ viewerCount: count }) => {
      setViewerCount(count);
    });

    socket.on('viewer-left', ({ viewerCount: count }) => {
      setViewerCount(count);
    });

    socket.on('new-stream-chat', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('stream-ended', () => {
      toast.error('Stream has ended');
      setTimeout(() => navigate('/'), 2000);
    });

    return () => {
      socket.emit('leave-stream-room', { roomId: stream.roomId });
      socket.off('viewer-joined');
      socket.off('viewer-left');
      socket.off('new-stream-chat');
      socket.off('stream-ended');
    };
  }, [socket, stream]);

  const fetchStreamData = async () => {
    try {
      setLoading(true);

      // Get stream details
      const streamRes = await axiosInstance.get(`/stream/${streamId}`);
      const streamData = streamRes.data.stream;

      // Check if user is the host
      if (streamData.hostId._id === authUser._id) {
        toast.error("You cannot watch your own stream");
        navigate('/');
        return;
      }

      setStream(streamData);
      setViewerCount(streamData.viewerCount);

      // Join stream
      const joinRes = await axiosInstance.post(`/stream/${streamId}/join`);
      const { hlsUrl } = joinRes.data;

      // Fetch chat history
      const chatRes = await axiosInstance.get(`/stream/${streamId}/chat`);
      setMessages(chatRes.data.chat);

      // Setup HLS player with low latency settings
      console.log(videoRef.current);
      
      if (videoRef.current) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,         // Don't chase the live edge
            liveSyncDurationCount: 3,      // Stay 3 segments (~12s) behind live edge
            liveMaxLatencyDurationCount: 5,// Don’t exceed 5 segments delay
            maxBufferLength: 20,           // Keep up to 20s in buffer
            maxMaxBufferLength: 30,
            backBufferLength: 10,
          });



          hls.loadSource(`http://localhost:5001${hlsUrl}`);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current.play().catch(err => {
              console.log('Autoplay prevented:', err);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  break;
              }
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = `http://localhost:5001${hlsUrl}`;
          videoRef.current.play().catch(err => {
            console.log('Autoplay prevented:', err);
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching stream:', err);
      toast.error(err.response?.data?.message || 'Failed to load stream');
      setLoading(false);
      navigate('/');
    }
  };

  const leaveStream = async () => {
    if (stream) {
      try {
        await axiosInstance.post(`/stream/${stream._id}/leave`);
      } catch (err) {
        console.error('Error leaving stream:', err);
      }
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      await axiosInstance.post(`/stream/${streamId}/chat`, {
        message: messageInput
      });
      setMessageInput('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Stream not found</p>
          <button onClick={() => navigate('/')} className="btn btn-primary mt-4">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto p-4 pt-20">
        <button
          onClick={() => {
            leaveStream();
            navigate('/');
          }}
          className="btn btn-ghost mb-4 gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Streams
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-lg overflow-hidden shadow-xl">
              <div className="aspect-video bg-black relative">
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                  playsInline
                />
                <div className="absolute top-4 left-4 bg-error px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-semibold text-white">LIVE</span>
                </div>
                <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-lg flex items-center gap-2">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-sm text-white">{viewerCount}</span>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-2xl font-bold mb-2">{stream.title}</h2>
                <div className="flex items-center gap-3 mb-2">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                      <img
                        src={stream.hostId.profilePic || '/avatar.png'}
                        alt={stream.hostId.fullName}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">{stream.hostId.fullName}</div>
                    <div className="text-sm opacity-70">{viewerCount} watching</div>
                  </div>
                </div>
                {stream.description && (
                  <p className="text-sm opacity-80 mt-2">{stream.description}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <span className="badge badge-primary">{stream.streamType}</span>
                  <span className="badge badge-secondary">{stream.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-base-100 rounded-lg shadow-xl flex flex-col h-[600px]">
            <div className="p-4 border-b border-base-300">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Live Chat
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-sm opacity-50 mt-8">
                  No messages yet. Be the first to chat!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className="text-sm">
                  <div className="flex items-start gap-2">
                    <div className="avatar">
                      <div className="w-6 h-6 rounded-full">
                        <img
                          src={msg.senderId?.profilePic || '/avatar.png'}
                          alt={msg.senderId?.fullName}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-primary">
                        {msg.senderId?.fullName || 'User'}:
                      </span>{' '}
                      <span className="break-words">{msg.message}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-base-300">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Send a message..."
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={sendMessage}
                  className="btn btn-primary"
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamViewerPage;