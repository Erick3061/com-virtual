import axios from "axios";
import { ReceiverPost, ResponseReceiver } from "../interfaces/interfaces";
import path from "path";
import { log } from "console";
export const baseURL = 'http://localhost:4000';

export const instance = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});


// * Receiver
export const newReceiver = async (data: ReceiverPost) => {
    const response = await axios.post(`${baseURL}/receiver`, data);
    return response.data.rv as ResponseReceiver;
}

export const stopReceiver = async (id: string) => {
    const response = await axios.get(`${baseURL}/receiver/stop/${id}`);
    return response.data.msg as string;
}

export const getReceivers = async () => {
    const response = await axios.get(`${baseURL}/receiver`);
    return response.data.rv as Array<ResponseReceiver>;
}

export const removeReceiver = async (id: string) => {
    const response = await axios.delete(`${baseURL}/receiver/${id}`);
    return response.data.msg as string;
}

export const startReceiver = async (id: string) => {
    const response = await axios.get(`${baseURL}/receiver/start/${id}`);
    return response.data.msg as string;
}

// * Sender
export const addSender = async ({ id, ip, port }: { id: string, ip?: string, port: number }) => {
    const response = await axios.post(`${baseURL}/receiver/add-sender/${id}`, { ip, port });
    return response.data.msg as string;
}

export const stopSender = async (id: string) => {
    const response = await axios.get(`${baseURL}/receiver/stop-sender/${id}`);
    return response.data.msg as string;
}

export const removeSernder = async (id: string) => {
    const response = await axios.delete(`${baseURL}/receiver/sender/${id}`);
    return response.data.msg as string;
}

export const startSender = async (id: string) => {
    const response = await axios.get(`${baseURL}/receiver/start-sender/${id}`);
    return response.data.msg as string;
}
