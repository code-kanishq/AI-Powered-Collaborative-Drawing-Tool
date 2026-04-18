import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const messages = res.data.messages;

  const shapes = messages
    .map((x: { message: string }) => {
      try {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
      } catch {
        return null;
      }
    })
    .filter(Boolean); // remove any nulls from failed parses

  return shapes;
}