import { useEffect, useState } from "react";
import { MoveRight, Plus, Trash } from "lucide-react";
import { useGuildStore } from "../store/useGuildStore";
import CreateGuildModel from "./CreateGuildModel";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";

const MyGuilds = () => {
  const { guilds, isLoadingGuilds, getGuilds, setSelectedGuild, deleteGuild } =
    useGuildStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate()
  const [showModel, setShowModel] = useState(false);

  const userId = authUser._id;


  useEffect(() => {
    getGuilds();
  }, [getGuilds]);


  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Guilds 🏰</h1>
        <button
          className="btn btn-primary flex items-center gap-2"
          onClick={() => setShowModel(true)}
        >
          <Plus size={18} /> Create Guild
        </button>
      </div>

      {/* Loader */}
      {isLoadingGuilds && (
        <div className="text-center text-gray-500">Loading guilds...</div>
      )}

      {/* Guilds Grid */}
      {!isLoadingGuilds && guilds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild) => {
            const member = guild.members.find((m) => m.member === userId);

            return (
              <div
                key={guild._id}
                className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition"
              >
                <figure>
                  <img
                    src={
                      guild.guildIcon ||
                      "https://media.istockphoto.com/id/641205724/photo/val-dorcia-tuscany-italy.jpg?s=612x612&w=0&k=20&c=27XSZydMGm6q9yLuJ5Qqlu87jR1UBNTViSzHf3SfbWY="
                    }
                    alt={guild.guildName}
                    className="object-cover h-32 w-full"
                  />
                </figure>
                <div className="card-body p-4">
                  <h2 className="card-title">{guild.guildName}</h2>
                  <div className="flex justify-between">
                    <div className="flex gap-5">
                      <span className="text-sm opacity-80">
                        {guild.guildType || "Public"}
                      </span>
                      <span className="text-sm opacity-80">
                        {member ? member.role : "Member"}
                      </span>
                    </div>

                    <div className="buttons flex gap-5">
                      {/* MoveRight Button */}
                      <div className="relative group">
                        <button
                         onClick={()=>{
                            setSelectedGuild(guild)
                            
                            navigate(`/${guild.guildName}`)
                         }}
                         className="cursor-pointer p-2 rounded hover:bg-green-500 hover:text-black transition-colors">
                          <MoveRight />
                        </button>
                        <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Go
                        </span>
                      </div>

                      {/* Trash Button */}
                      {member.role === "GuildMaster" && (
                        <div className="relative group">
                          <button
                            onClick={() => deleteGuild(guild._id)}
                            className="cursor-pointer p-2 rounded hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash />
                          </button>
                          <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Guilds */}
      {!isLoadingGuilds && guilds.length === 0 && (
        <div className="text-center text-gray-500">
          You don’t have any guilds yet.
        </div>
      )}

      {/* Create Guild Modal */}
      <CreateGuildModel open={showModel} onClose={() => setShowModel(false)} />
    </div>
  );
};

export default MyGuilds;
