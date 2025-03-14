import { Channel } from "@/interfaces/channel";
import { Response } from "@/interfaces/response";
import { api } from "../api";
import { AxiosError, HttpStatusCode } from "axios";


const GUILD_ENDPOINT = process.env.NEXT_PUBLIC_API_URL + '/guilds'
const USER_ENDPOINT = process.env.NEXT_PUBLIC_API_URL + '/users/me/channels'
export async function getDMChannels(): Promise<Response<Channel[]>> {
    try {
        const response = await api.get(`${USER_ENDPOINT}`, {
            withCredentials: true
        });
        if (response.status === HttpStatusCode.Ok) {
            return Response.Success<Channel[]>({
                data: response.data.data,
                message: response.data.message
            });
        }
        return Response.Failed<Channel[]>({
            message: response.data.message
        });
    } catch (error) {
        if (error instanceof AxiosError)
            return Response.Failed<Channel[]>({
                message: error.response ? error.response.data.message as string : "An unknown Error occurred"
            });
    }

    return Response.Failed<Channel[]>({
        message: "An unknown error occurred."
    })
}

export async function createDMChannel(recipientId: string): Promise<Response<Channel>> {
    try {
        const response = await api.post(`${USER_ENDPOINT}`, {recipientId: recipientId}, {
            withCredentials: true
        });
        if (response.status === HttpStatusCode.Created) {
            return Response.Success<Channel>({
                data: response.data.data,
                message: response.data.message
            });
        }
        return Response.Failed<Channel>({
            message: response.data.message
        });
    } catch (error) {
        if (error instanceof AxiosError)
            return Response.Failed<Channel>({
                message: error.response ? error.response.data.message as string : "An unknown Error occurred"
            });
    }

    return Response.Failed<Channel>({
        message: "An unknown error occurred."
    })
}

export async function createGuildchannel(guildId: string, ) {

}