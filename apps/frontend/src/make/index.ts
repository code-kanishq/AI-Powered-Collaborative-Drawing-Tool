import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type RectShape = {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
};

type CircleShape = {
  type: "circle";
  centerX: number;
  centerY: number;
  radius: number;
};

type PencilShape = {
  type: "pencil";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

type Shape = RectShape | CircleShape | PencilShape;

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  // When a message comes from socket, update shapes and redraw
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  // Initial render
  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    // Use coordinates relative to the canvas
    startX = e.offsetX;
    startY = e.offsetY;
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!clicked) return;
    clicked = false;

    const endX = e.offsetX;
    const endY = e.offsetY;

    const width = endX - startX;
    const height = endY - startY;

    // @ts-ignore
    const selectedTool = window.selectedTool as "rect" | "circle" | "pencil" | undefined;

    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const dx = endX - startX;
      const dy = endY - startY;

      const radius = Math.sqrt(dx * dx + dy * dy) / 2;

      shape = {
        type: "circle",
        radius,
        centerX: startX + dx / 2,
        centerY: startY + dy / 2,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX,
        startY,
        endX,
        endY,
      };
    }

    if (!shape) {
      return;
    }

    existingShapes.push(shape);

    // Broadcast to other clients
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId,
      })
    );

    // Redraw including the new shape
    clearCanvas(existingShapes, canvas, ctx);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    const width = currentX - startX;
    const height = currentY - startY;

    clearCanvas(existingShapes, canvas, ctx);

    ctx.strokeStyle = "rgba(0,0,0)";
    // @ts-ignore
    const selectedTool = window.selectedTool as "rect" | "circle" | "pencil" | undefined;

    if (selectedTool === "rect") {
      ctx.strokeRect(startX, startY, width, height);
    } else if (selectedTool === "circle") {
      const dx = currentX - startX;
      const dy = currentY - startY;

      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      const centerX = startX + dx / 2;
      const centerY = startY + dy / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    } else if (selectedTool === "pencil") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.closePath();
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255,255,255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(0,0,0)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      const radius = Math.abs(shape.radius); // safety for old negative data
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    } else if (shape.type === "pencil") {
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
      ctx.closePath();
    }
  });
}

async function getExistingShapes(roomId: string): Promise<Shape[]> {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
  const messages = res.data.messages;

  const shapes: Shape[] = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape as Shape;
  });

  return shapes;
}
