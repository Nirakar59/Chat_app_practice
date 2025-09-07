import { useState } from "react";
import { useGuildStore } from "../store/useGuildStore";
import GuildIconInput from "./GuildIconInput";

const CreateGuildModel = ({ open, onClose }) => {
    const { createGuild, getGuilds } = useGuildStore();
    const [guildData, setGuildData] = useState({
        guildName: "",
        guildType: "public",
        guildIcon: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!guildData.guildName.trim()) return;

        setIsSubmitting(true);
        await createGuild(guildData);
        await getGuilds();
        setGuildData({ guildName: "", guildType: "public", guildIcon: "" });
        setIsSubmitting(false);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-base-100 p-6 rounded-xl w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">Create a New Guild</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Guild Name"
                        className="input input-bordered w-full"
                        value={guildData.guildName}
                        onChange={(e) =>
                            setGuildData({ ...guildData, guildName: e.target.value })
                        }
                        required
                    />

                    <select
                        className="select select-bordered w-full"
                        value={guildData.guildType}
                        onChange={(e) =>
                            setGuildData({ ...guildData, guildType: e.target.value })
                        }
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>

                    {/* Guild Icon Input */}
                    <GuildIconInput guildData={guildData} setGuildData={setGuildData} />

                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Guild"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGuildModel;
