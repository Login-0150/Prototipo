import { Router, type IRouter } from "express";
import { getRooms, createRoom, deleteRoom } from "../lib/rooms";

const router: IRouter = Router();

router.get("/rooms", (_req, res): void => {
  res.json(getRooms());
});

router.post("/rooms", (req, res): void => {
  const { name, password, createdBy } = req.body as { name?: string; password?: string; createdBy?: string };
  if (!name) {
    res.status(400).json({ error: "Room name required" });
    return;
  }
  const id = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const room = createRoom(id, name.trim(), createdBy || "anonymous", password || undefined);
  res.status(201).json({ id: room.id, name: room.name, isPrivate: room.isPrivate, createdBy: room.createdBy });
});

router.delete("/rooms/:roomId", (req, res): void => {
  const { roomId } = req.params;
  const { userId } = req.body as { userId?: string };
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  if (roomId === "general") {
    res.status(403).json({ error: "Cannot delete general room" });
    return;
  }
  const success = deleteRoom(roomId, userId);
  if (!success) {
    res.status(403).json({ error: "Not authorized or room not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
