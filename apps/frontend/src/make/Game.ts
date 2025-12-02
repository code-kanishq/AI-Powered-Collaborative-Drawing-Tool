// apps/frontend/make/Game.ts
import { getExistingShapes } from "./http";
import type { Tool } from "./tool-types";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private socket: WebSocket;

  // Mouse event handlers held as references
  private handleMouseDown = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.clicked) return;
    this.clicked = false;

    const endX = e.offsetX;
    const endY = e.offsetY;

    const width = endX - this.startX;
    const height = endY - this.startY;
    const selectedTool = this.selectedTool;

    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const dx = endX - this.startX;
      const dy = endY - this.startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;

      shape = {
        type: "circle",
        radius,
        centerX: this.startX + dx / 2,
        centerY: this.startY + dy / 2,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX,
        endY,
      };
    }

    if (!shape) return;

    this.existingShapes.push(shape);

    // Broadcast through WS
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );

    this.clearCanvas();
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.clicked) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    const width = currentX - this.startX;
    const height = currentY - this.startY;

    this.clearCanvas();
    this.ctx.strokeStyle = "rgba(0,0,0)";

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const dx = currentX - this.startX;
      const dy = currentY - this.startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      const centerX = this.startX + dx / 2;
      const centerY = this.startY + dy / 2;

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "pencil") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");
    this.ctx = ctx;

    this.roomId = roomId;
    this.socket = socket;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  // ============================================================
  // PUBLIC FUNCTIONS — CALLED BY AI ASSISTANT
  // ============================================================

  /** AI: draw a circle */
  drawCircle(centerX: number, centerY: number, radius: number) {
    const shape: Shape = {
      type: "circle",
      centerX,
      centerY,
      radius,
    };

    this.existingShapes.push(shape);
    this.broadcast(shape);
    this.clearCanvas();
  }

  /** AI: draw a rectangle */
  drawRect(x: number, y: number, width: number, height: number) {
    const shape: Shape = {
      type: "rect",
      x,
      y,
      width,
      height,
    };

    this.existingShapes.push(shape);
    this.broadcast(shape);
    this.clearCanvas();
  }

  /** AI: draw a line */
  drawLine(x1: number, y1: number, x2: number, y2: number) {
    const shape: Shape = {
      type: "pencil",
      startX: x1,
      startY: y1,
      endX: x2,
      endY: y2,
    };

    this.existingShapes.push(shape);
    this.broadcast(shape);
    this.clearCanvas();
  }

  // Broadcast shape to websocket
  private broadcast(shape: Shape) {
    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
  }

  // ============================================================

  private async init() {
    try {
      const shapes = await getExistingShapes(this.roomId);
      this.existingShapes.push(...shapes);
      this.clearCanvas();
    } catch (e) {
      console.error("Failed to load shapes", e);
      this.clearCanvas();
    }
  }

  private initHandlers() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "chat") {
          const parsed = JSON.parse(message.message);
          if (parsed?.shape) {
            this.existingShapes.push(parsed.shape as Shape);
            this.clearCanvas();
          }
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };
  }

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mouseup", this.handleMouseUp);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.forEach((shape) => {
      this.ctx.strokeStyle = "black";

      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "pencil") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.startX, shape.startY);
        this.ctx.lineTo(shape.endX, shape.endY);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.socket.onmessage = null;
  }
}
