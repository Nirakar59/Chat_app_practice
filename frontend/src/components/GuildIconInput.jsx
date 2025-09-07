import { useState } from "react";

const GuildIconInput = ({ guildData, setGuildData }) => {
    const [preview, setPreview] = useState(guildData.guildIcon || null);

    const handleImage = (e) => {
        const img = e.target.files?.[0];
        if (!img) return;

        const reader = new FileReader();
        reader.readAsDataURL(img);

        reader.onload = () => {
            const base64imageUrl = reader.result;
            setPreview(base64imageUrl);
            setGuildData({ ...guildData, guildIcon: base64imageUrl });
        };
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="w-32 h-32">
                <img
                    src={preview || "/guild-placeholder.png"}
                    alt="Guild Icon"
                    className="w-full h-full object-cover rounded-full border-2 border-base-300"
                />
            </div>
            <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="file-input file-input-bordered w-full max-w-xs"
            />
            <p className="text-xs text-gray-500 text-center">
                Upload a guild icon
            </p>
        </div>
    );
};

export default GuildIconInput;
