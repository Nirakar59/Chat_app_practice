import React, { useEffect } from 'react';
import { useGuildStore } from '../store/useGuildStore';
import { useParams } from 'react-router';
import { User, Eye, MessageCircle } from 'lucide-react';

const GuildPage = () => {
  const { guildName } = useParams();
  const { selectedGuild, getGuildByName } = useGuildStore();

  useEffect(() => {
    getGuildByName(guildName);
  }, [getGuildByName, guildName]);

  if (!selectedGuild) {
    return <div className="text-center mt-20 text-gray-500">Loading guild...</div>;
  }

  const guild = selectedGuild;

  return (
    <div className="p-6">
      {/* Guild Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h5 className="text-3xl font-bold">{guild.guildName}</h5>
        </div>

        {/* Chat Button (always visible) */}
        <button
          onClick={() => console.log("Open Chat")} // <-- replace with your handler
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
        >
          <MessageCircle size={18} />
          Chat
        </button>
      </div>

      {/* Streams Grid */}
      {guild.streams && guild.streams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guild.streams.map((stream) => (
            <div
              key={stream._id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
            >
              {/* Stream Thumbnail */}
              <img
                src={stream.thumbnailUrl || "https://via.placeholder.com/400x200?text=No+Thumbnail"}
                alt={stream.title}
                className="w-full h-48 object-cover"
              />

              {/* Stream Info */}
              <div className="p-4">
                <h2 className="text-lg font-semibold">{stream.title}</h2>
                <p className="text-sm text-gray-500 mb-2">{stream.description || "No description"}</p>

                <div className="flex items-center justify-between text-gray-600 text-sm">
                  {/* Host */}
                  <div className="flex items-center gap-1">
                    <User size={16} />
                    <span>{stream.hostId?.username || "Host"}</span>
                  </div>

                  {/* Viewer Count */}
                  <div className="flex items-center gap-1">
                    <Eye size={16} />
                    <span>{stream.viewerCount}</span>
                  </div>
                </div>

                {/* Join Stream Button */}
                <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition">
                  Join Stream
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-10">No streams available yet.</div>
      )}
    </div>
  );
};

export default GuildPage;
