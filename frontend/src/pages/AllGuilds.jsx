import React, { useEffect } from "react"
import { useGuildStore } from "../store/useGuildStore"

const AllGuilds = () => {
  const { publicGuilds, getAllGuilds, joinGuild } = useGuildStore()

  useEffect(() => {
    getAllGuilds()
  }, [getAllGuilds])

  return (
    <div className="p-6">

      {publicGuilds.length === 0 ? (
        <p className="text-center text-gray-500">No public guilds available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicGuilds.map((guild) => (
            <div
              key={guild._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition"
            >
              {/* Guild Banner */}
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

              {/* Guild Info */}
              <div className="card-body p-4">
                <h2 className="card-title">{guild.guildName}</h2>
                <p className="text-sm opacity-80">
                  {guild.members?.length || 0} members
                </p>

                {/* Join Button */}
                <div className="card-actions mt-4">
                  <button
                    onClick={() => joinGuild(guild._id)}
                    className="btn btn-primary btn-sm w-full"
                  >
                    Join Guild
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AllGuilds
