import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useGuildStore } from "../store/useGuildStore";
import CreateGuildModel from "./CreateGuildModel";

const Guilds = () => {
    const { guilds, isLoadingGuilds, getGuilds, setSelectedGuild } = useGuildStore();
    const [showModel, setShowModel] = useState(false);

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
                    {guilds.map((guild) => (
                        <div
                            key={guild._id}
                            className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition"
                            onClick={() => setSelectedGuild(guild)}
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
                                <p className="text-sm opacity-80">{guild.guildType || "public"}</p>
                            </div>
                        </div>
                    ))}
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

export default Guilds;
