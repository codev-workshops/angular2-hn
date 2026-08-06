import axios from 'axios';

export const http = axios.create({
    baseURL: 'https://node-hnapi.herokuapp.com',
    withCredentials: false,
    validateStatus: () => true,
    responseType: 'text',
    transformResponse: [
        (data: unknown) => {
            if (typeof data !== 'string') {
                return data;
            }
            return JSON.parse(data);
        },
    ],
});

export async function getJson<T>(url: string): Promise<T> {
    const response = await http.get<T>(url);
    return response.data;
}
