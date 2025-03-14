import { DM_CHANNELS_CACHE, GUILDS_CACHE } from "@/constants/cache";
import { Guild } from "@/interfaces/guild";
import { getDMChannels } from "@/services/channels/channels.service";
import { getGuildDetail, getGuilds } from "@/services/guild/guild.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useDMChannelsQuery() {
    return useQuery({
        staleTime: Infinity,
        queryKey: [DM_CHANNELS_CACHE],
        queryFn: async () => {
            const res = await getDMChannels();
            if (res.success) {
                return res.data!;
            }

            return [];
        }
    })
}

export function useGuildsQuery() {
    return useQuery({
        staleTime: Infinity,
        queryKey: [GUILDS_CACHE],
        queryFn: async () => {
            const res = await getGuilds();
            console.log(res)
            if (res.success) {
                return res.data!;
            }

            return [];
        }
    })
}

export function useGuildDetailQuery(guildId: string) {
    const queryClient = useQueryClient();
    return useQuery({
        staleTime: Infinity,
        queryKey: [GUILDS_CACHE, guildId],
        queryFn: async () => {
            console.log(`Guild data ${guildId} is stale, refetching`);
            const res = await getGuildDetail(guildId);

            if (!res.success) {
                return;
            }
            queryClient.setQueryData<Guild[]>([GUILDS_CACHE], (old) => {
                if (!old) {
                    return [res.data!];
                }

                return old.map(g => g.id === res.data!.id ? res.data! : g);
            })

            return res.data!;
        }
    })
}