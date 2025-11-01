import { useEffect, useState } from "react";
import { MoveRight, Plus, Trash, Crown, Shield, Users } from "lucide-react";
import { useGuildStore } from "../store/useGuildStore";
import CreateGuildModel from "./CreateGuildModel";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router";

const MyGuilds = () => {
  const { guilds, isLoadingGuilds, getGuilds, setSelectedGuild, deleteGuild } = useGuildStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [showModel, setShowModel] = useState(false);

  const userId = authUser._id;

  useEffect(() => {
    getGuilds();
  }, [getGuilds]);

  const getRoleIcon = (role) => {
    switch (role) {
      case "GuildMaster": return <Crown className="w-4 h-4 text-warning" />;
      case "Vice-GuildMaster": return <Shield className="w-4 h-4 text-info" />;
      default: return <Users className="w-4 h-4 text-base-content/60" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      "GuildMaster": "badge-warning",
      "Vice-GuildMaster": "badge-info",
      "Streamer": "badge-secondary",
      "GuildMember": "badge-ghost"
    };
    return badges[role] || "badge-ghost";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-6 rounded-3xl shadow-xl border border-base-300">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Your Guilds
          </h1>
          <p className="text-base-content/60">
            {guilds.length} {guilds.length === 1 ? 'guild' : 'guilds'} you're part of
          </p>
        </div>
        <button
          className="btn btn-primary gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          onClick={() => setShowModel(true)}
        >
          <Plus size={20} />
          <span className="font-semibold">Create Guild</span>
        </button>
      </div>

      {/* Loader */}
      {isLoadingGuilds && (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">Loading guilds...</p>
        </div>
      )}

      {/* Guilds Grid */}
      {!isLoadingGuilds && guilds.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {guilds.map((guild) => {
            const member = guild.members.find((m) => m.member === userId);

            return (
              <div
                key={guild._id}
                className="group bg-base-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-base-300 hover:scale-105"
              >
                {/* Guild Image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={guild.guildIcon || "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=500"}
                    alt={guild.guildName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Guild Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-primary badge-sm font-semibold shadow-lg">
                      {guild.guildType || "Public"}
                    </span>
                  </div>

                  {/* Role Badge */}
                  {member && (
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${getRoleBadge(member.role)} badge-sm gap-1 font-semibold shadow-lg`}>
                        {getRoleIcon(member.role)}
                        {member.role.replace("Guild", "")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Guild Info */}
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-2 line-clamp-1">{guild.guildName}</h2>

                  <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{guild.members?.length || 0} members</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedGuild(guild);
                        navigate(`/${guild.guildName}`);
                      }}
                      className="flex-1 btn btn-sm btn-primary gap-2 hover:scale-105 transition-all"
                    >
                      <MoveRight className="w-4 h-4" />
                      Open
                    </button>

                    {member?.role === "GuildMaster" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete ${guild.guildName}? This action cannot be undone.`)) {
                            deleteGuild(guild._id);
                          }
                        }}
                        className="btn btn-sm btn-error btn-outline hover:scale-105 transition-all"
                        title="Delete Guild"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Guilds State */}
      {!isLoadingGuilds && guilds.length === 0 && (
        <div className="bg-base-100 rounded-3xl p-12 text-center shadow-xl border border-base-300">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 p-8 rounded-full">
              <Users className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-3">No Guilds Yet</h3>
          <p className="text-base-content/60 mb-6 max-w-md mx-auto">
            You're not part of any guilds. Create your own or join existing ones to get started!
          </p>
          <button
            onClick={() => setShowModel(true)}
            className="btn btn-primary gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Plus size={20} />
            Create Your First Guild
          </button>
        </div>
      )}

      {/* Create Guild Modal */}
      <CreateGuildModel open={showModel} onClose={() => setShowModel(false)} />
    </div>
  );
};

export default MyGuilds;