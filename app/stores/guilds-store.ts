import { Channel } from "@/interfaces/channel";
import { Guild } from "@/interfaces/guild";
import { IoMdReturnLeft } from "react-icons/io";
import { create } from "zustand";

type GuildMap = Map<string, Guild>;

interface GuildStoreState {
    guilds: Map<string, Guild>;
    setGuilds: (guilds: GuildMap) => void;
    addGuild: (guild: Guild) => void;
    removeGuild: (guildId: string) => void;
    getGuild: (guildId: string) => Guild | undefined;
    updateChannel: (guildId: string, channelId: string, channel: Channel) => void;
    updateChannelLastRead: (guildId: string, channelId: string, messageId: string) => void;
}

export const useGuildsStore = create<GuildStoreState>((set, get) => ({
    guilds: new Map(),
    setGuilds: (guilds) => set({ guilds }),
    addGuild: (guild) => set((state) => {
        const newGuilds = new Map(state.guilds);
        newGuilds.set(guild.id, guild);

        return { guilds: newGuilds };
    }),
    removeGuild: (guildId) => set((state) => {
        const newGuilds = new Map(state.guilds);
        newGuilds.delete(guildId);

        return { guilds: newGuilds };
    }),
    getGuild: (guildId) => get().guilds.get(guildId),
    updateChannel: (guildId, channelId, channel) => {
        set((state) => {
            const guild = state.guilds.get(guildId);
            if (!guild) return state;

            const updatedChannels = guild.channels.map((ch) =>
                ch.id === channelId
                    ? { ...ch,  ...channel}
                    : ch
            );

            const updatedGuild: Guild = { ...guild, channels: updatedChannels };

            const newGuilds = new Map(state.guilds);
            newGuilds.set(guildId, updatedGuild);

            return { guilds: newGuilds }
        })
    },
    updateChannelLastRead: (guildId, channelId, messageId) => {
        set((state) => {
            const guild = state.guilds.get(guildId);
            if (!guild) return state;

            const updatedChannels = guild.channels.map((channel) =>
                channel.id === channelId
                    ? { ...channel, lastReadId: messageId }
                    : channel
            );

            const updatedGuild: Guild = { ...guild, channels: updatedChannels };

            const newGuilds = new Map(state.guilds);
            newGuilds.set(guildId, updatedGuild);

            return { guilds: newGuilds }
        })
    }
}))

export const useGetGuild = (guildId: string) => useGuildsStore.getState().getGuild(guildId);



