import axios from "axios";
import { ResponseReceiver } from "../interfaces/interfaces";

export const baseURL = 'http://localhost:4000';

export const instance = axios.create({
    baseURL: baseURL,
});


export const getReceivers = async () => {
    const response = await axios.get(`${baseURL}/receiver`);
    return response.data.rv as Array<ResponseReceiver>;
}


