import React, { useState, useRef, useEffect } from 'react';
import { Camera, Monitor, Mic, MicOff, Video, VideoOff, Play, Square, ArrowLeft, AlertCircle, Eye, Users, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const StreamerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, socket } = useAuthStore();

  const [streamConfig, setStreamConfig] = useState({
    title: '',
    description: '',
    streamType: location.state?.streamType || 'Public',
    category: 'Gaming',
    guildId: location.state?.guildId || null
  });

  const [captureMode, setCaptureMode] = useState('camera');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamData, setStreamData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chatEndRef = useRef(null);
  const [guilds, setGuilds] = useState([]);

  useEffect(() => {
    // Fetch user's guilds for guild-based streaming
    const fetchGuilds = async () => {
      try {
        const res = await axiosInstance.get('/guild/getmyguilds');
        setGuilds(res.data);
      } catch (err) {
        console.error('Error fetching guilds:', err);
      }
    };
    fetchGuilds();

    return () => {
      stopStreaming();
    };
  }, []);

  // Attach stream to video element whenever videoRef or streamRef changes
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      console.log("Attaching stream to video element");
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, [setupComplete]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket || !streamData) return;

    socket.on('viewer-joined', ({ viewerCount: count }) => {
      setViewerCount(count);
    });

    socket.on('viewer-left', ({ viewerCount: count }) => {
      setViewerCount(count);
    });

    socket.on('stream-error', ({ error: err }) => {
      setError(err);
      toast.error(err);
    });

    socket.on('new-stream-chat', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('viewer-joined');
      socket.off('viewer-left');
      socket.off('stream-error');
      socket.off('new-stream-chat');
    };
  }, [socket, streamData]);

  const startCapture = async () => {
    try {
      setError('');
      setStatus('Starting capture...');
      let stream;

      if (captureMode === 'camera') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: audioEnabled
        });
      } else {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
          audio: false
        });

        if (audioEnabled) {
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const tracks = [...displayStream.getVideoTracks(), ...audioStream.getAudioTracks()];
            stream = new MediaStream(tracks);
          } catch (audioErr) {
            console.warn('Could not get audio:', audioErr);
            stream = displayStream;
          }
        } else {
          stream = displayStream;
        }
      }

      streamRef.current = stream;
      setStatus('Capture started - Ready to stream');
      return stream;
    } catch (err) {
      setError(`Failed to capture: ${err.message}`);
      setStatus('');
      throw err;
    }
  };

  const setupBroadcast = async () => {
    if (!streamConfig.title) {
      setError('Please enter a stream title');
      return;
    }

    if (streamConfig.streamType === 'Guild-Based' && !streamConfig.guildId) {
      setError('Please select a guild for guild-based streaming');
      return;
    }

    try {
      const stream = await startCapture();
      if (stream) {
        setSetupComplete(true);
        setError('');
        setStatus('Ready to stream');
      }
    } catch (err) {
      console.error('Setup failed:', err);
    }
  };

  const startStreaming = async () => {
    if (!streamRef.current) {
      setError('No media stream available');
      return;
    }

    try {
      setStatus('Creating stream...');

      // Create stream in database
      const response = await axiosInstance.post('/stream/start', {
        hostId: authUser._id,
        title: streamConfig.title,
        description: streamConfig.description,
        streamType: streamConfig.streamType,
        category: streamConfig.category,
        guildId: streamConfig.guildId
      });

      const { stream } = response.data;
      setStreamData(stream);

      // Fetch initial chat
      const chatRes = await axiosInstance.get(`/stream/${stream._id}/chat`);
      setMessages(chatRes.data.chat);

      setStatus('Connecting...');

      socket.emit('join-stream-room', { roomId: stream.roomId });

      socket.emit('start-browser-stream', {
        streamId: stream._id,
        roomId: stream.roomId
      });

      socket.once('stream-ready', ({ hlsUrl }) => {
        setStatus('🔴 LIVE - Streaming');
        setIsStreaming(true);
        toast.success('Stream started successfully!');

        let mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          const types = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8', 'video/webm'];
          for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
              mimeType = type;
              break;
            }
          }
        }

        const options = {
          mimeType,
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000
        };

        mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data && event.data.size > 0 && socket) {
            event.data.arrayBuffer().then(buffer => {
              socket.emit('stream-data', {
                roomId: stream.roomId,
                data: buffer
              });
            });
          }
        };

        mediaRecorderRef.current.start(500);
      });

    } catch (err) {
      setError(`Failed to start streaming: ${err.message}`);
      toast.error('Failed to start stream');
    }
  };

  const stopStreaming = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (streamData && socket) {
        socket.emit('stop-browser-stream', { roomId: streamData.roomId });
        await axiosInstance.delete(`/stream/${streamData._id}/stop`);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsStreaming(false);
      setSetupComplete(false);
      setStreamData(null);
      setMessages([]);
      toast.success('Stream stopped');
    } catch (err) {
      console.error('Error stopping stream:', err);
      toast.error('Error stopping stream');
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !streamData) return;

    try {
      await axiosInstance.post(`/stream/${streamData._id}/chat`, {
        message: messageInput
      });
      setMessageInput('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  if (!setupComplete) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="max-w-2xl mx-auto p-6 pt-20">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost mb-4 gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="bg-base-100 rounded-lg p-8 shadow-xl">
            <h2 className="text-3xl font-bold mb-6">Start Broadcasting</h2>

            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <p className="text-error">{error}</p>
              </div>
            )}

            {status && !error && (
              <div className="bg-info/10 border border-info rounded-lg p-4 mb-6">
                <p className="text-info">{status}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Stream Title *</label>
                <input
                  type="text"
                  value={streamConfig.title}
                  onChange={(e) => setStreamConfig({ ...streamConfig, title: e.target.value })}
                  placeholder="Enter your stream title"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={streamConfig.description}
                  onChange={(e) => setStreamConfig({ ...streamConfig, description: e.target.value })}
                  placeholder="Describe your stream..."
                  className="textarea textarea-bordered w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stream Type</label>
                <select
                  value={streamConfig.streamType}
                  onChange={(e) => setStreamConfig({ ...streamConfig, streamType: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="Public">Public</option>
                  <option value="Guild-Based">Guild-Based</option>
                </select>
              </div>

              {streamConfig.streamType === 'Guild-Based' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Guild</label>
                  <select
                    value={streamConfig.guildId || ''}
                    onChange={(e) => setStreamConfig({ ...streamConfig, guildId: e.target.value })}
                    className="select select-bordered w-full"
                  >
                    <option value="">Choose a guild...</option>
                    {guilds.map(guild => (
                      <option key={guild._id} value={guild._id}>
                        {guild.guildName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={streamConfig.category}
                  onChange={(e) => setStreamConfig({ ...streamConfig, category: e.target.value })}
                  className="select select-bordered w-full"
                >
                  <option value="Gaming">Gaming</option>
                  <option value="Education">Education</option>
                  <option value="Music">Music</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Capture Source</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCaptureMode('camera')}
                    className={`p-4 rounded-lg border-2 transition ${captureMode === 'camera'
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 hover:border-primary/50'
                      }`}
                  >
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-semibold">Webcam</div>
                  </button>
                  <button
                    onClick={() => setCaptureMode('screen')}
                    className={`p-4 rounded-lg border-2 transition ${captureMode === 'screen'
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 hover:border-primary/50'
                      }`}
                  >
                    <Monitor className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-semibold">Screen</div>
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioEnabled}
                    onChange={(e) => setAudioEnabled(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span>Enable Audio</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoEnabled}
                    onChange={(e) => setVideoEnabled(e.target.checked)}
                    className="checkbox checkbox-primary"
                  />
                  <span>Enable Video</span>
                </label>
              </div>

              <button
                onClick={setupBroadcast}
                disabled={!streamConfig.title}
                className="btn btn-primary w-full"
              >
                Setup Broadcast
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto p-4 pt-20">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="btn btn-ghost gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-4">
            {isStreaming && (
              <div className="flex items-center gap-2 bg-error px-3 py-1 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-sm font-semibold text-white">LIVE</span>
              </div>
            )}
            <div className="text-sm">{viewerCount} viewers</div>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error" />
            <p className="text-error">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-lg overflow-hidden shadow-xl mb-4">
              <div className="aspect-video bg-black relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />

                {!videoEnabled && (
                  <div className="absolute inset-0 bg-base-300 flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-base-content/50" />
                  </div>
                )}
                {isStreaming && (
                  <>
                    <div className="absolute top-4 left-4 bg-error px-3 py-2 rounded-lg flex items-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-white">STREAMING</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 px-3 py-2 rounded-lg flex items-center gap-2">
                      <Eye className="w-4 h-4 text-white" />
                      <span className="text-sm text-white">{viewerCount}</span>
                    </div>
                  </>
                )}
                {status && (
                  <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded-lg">
                    <span className="text-sm text-white">{status}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{streamConfig.title}</h2>
                <div className="flex items-center gap-4 text-sm opacity-70">
                  <span>{streamConfig.streamType}</span>
                  <span>•</span>
                  <span>{streamConfig.category}</span>
                  {isStreaming && <span className="text-success">● Live</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleAudio}
                className={`btn btn-circle ${audioEnabled ? 'btn-ghost' : 'btn-error'}`}
              >
                {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`btn btn-circle ${videoEnabled ? 'btn-ghost' : 'btn-error'}`}
              >
                {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </button>
              {!isStreaming ? (
                <button
                  onClick={startStreaming}
                  className="btn btn-success gap-2 px-8"
                >
                  <Play className="w-5 h-5" />
                  Start Streaming
                </button>
              ) : (
                <button
                  onClick={stopStreaming}
                  className="btn btn-error gap-2 px-8"
                >
                  <Square className="w-5 h-5" />
                  Stop Streaming
                </button>
              )}
            </div>
          </div>

          {/* Chat */}
          {isStreaming && (
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
                    No messages yet. Chat with your viewers!
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamerPage;