// apps/frontend/app/canvas/[roomId]/page.tsx
import { RoomCanvas } from "@/components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  // params is a Promise in this Next.js version
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return <RoomCanvas roomId={roomId} />;
}
