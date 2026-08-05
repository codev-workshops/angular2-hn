import axios from 'axios';
import type { Story, User, PollResult } from '../models';

export const http = axios.create({
  baseURL: 'https://node-hnapi.herokuapp.com',
});

export async function fetchFeed(feedType: string, page: number): Promise<Story[]> {
  const { data } = await http.get<Story[]>(`/${feedType}`, { params: { page } });
  return data;
}

export async function fetchItem(id: number): Promise<Story> {
  const { data } = await http.get<Story>(`/item/${id}`);
  return data;
}

export async function fetchPollResult(id: number): Promise<PollResult> {
  const { data } = await http.get<PollResult>(`/item/${id}`);
  return data;
}

export async function fetchUser(id: string): Promise<User> {
  const { data } = await http.get<User>(`/user/${id}`);
  return data;
}
