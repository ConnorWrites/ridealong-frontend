import api from "./client";
import type { Message } from "../types";

export async function listMessages(requestId: string): Promise<Message[]> {
  const res = await api.get(`/rides/requests/${requestId}/messages`);
  return res.data;
}

export async function sendMessage(requestId: string, content: string): Promise<Message> {
  const res = await api.post(`/rides/requests/${requestId}/messages`, { content });
  return res.data;
}