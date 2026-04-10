import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";

export interface Participant {
  socketId: string;
  userId: string;
  userName: string;
  avatarColor: string;
  joinedAt: number;
}

export interface Track {
  id: string;
  type: "youtube" | "spotify" | "deezer" | "radio";
  title: string;
  artist: string;
  thumbnail?: string;
  videoId?: string;
  streamUrl?: string;
  previewUrl?: string;
  spotifyId?: string;
  duration?: number;
  addedBy: string;
  addedByName: string;
}

interface Room {
  id: string;
  name: string;
  password?: string;
  isPrivate: boolean;
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  positionSetAt: number;
  participants: Map<string, Participant>;
  hostSocketId: string;
  createdBy: string;
  createdAt: number;
}

const AVATAR_COLORS = ["#6432FF", "#FF3264", "#32FF96", "#FF9632", "#32C8FF", "#C832FF"];
const rooms = new Map<string, Room>();
const socketToRoom = new Map<string, string>();
const socketToUser = new Map<string, string>();

rooms.set("general", {
  id: "general",
  name: "Sala General",
  isPrivate: false,
  currentTrack: null,
  queue: [],
  isPlaying: false,
  position: 0,
  positionSetAt: Date.now(),
  participants: new Map(),
  hostSocketId: "",
  createdBy: "system",
  createdAt: Date.now(),
});

function getRoomPublic(room: Room) {
  return {
    id: room.id,
    name: room.name,
    isPrivate: room.isPrivate,
    currentTrack: room.currentTrack,
    queue: room.queue,
    isPlaying: room.isPlaying,
    position: room.position,
    participants: Array.from(room.participants.values()),
    hostSocketId: room.hostSocketId,
    createdBy: room.createdBy,
    createdAt: room.createdAt,
  };
}

function getCurrentPosition(room: Room): number {
  if (!room.isPlaying) return room.position;
  return room.position + (Date.now() - room.positionSetAt) / 1000;
}

function send(ws: WebSocket, type: string, data: unknown) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, data }));
  }
}

function broadcast(wss: WebSocketServer, roomId: string, type: string, data: unknown, exclude?: WebSocket) {
  wss.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN) return;
    const clientRoom = socketToRoom.get((client as any)._socketId);
    if (clientRoom !== roomId) return;
    if (client === exclude) return;
    client.send(JSON.stringify({ type, data }));
  });
}

function broadcastAll(wss: WebSocketServer, roomId: string, type: string, data: unknown) {
  broadcast(wss, roomId, type, data);
}

let socketCounter = 0;

export function setupWebSocketHandlers(wss: WebSocketServer) {
  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    const socketId = `sock_${++socketCounter}_${Date.now()}`;
    (ws as any)._socketId = socketId;

    ws.on("message", (raw) => {
      let msg: { type: string; data: any };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      const { type, data } = msg;

      if (type === "join-room") {
        const { roomId, userId, userName, password } = data;
        const room = rooms.get(roomId);
        if (!room) { send(ws, "error", { message: "Room not found" }); return; }
        if (room.isPrivate && room.password && room.password !== password) {
          send(ws, "error", { message: "Incorrect password" }); return;
        }

        const oldRoomId = socketToRoom.get(socketId);
        if (oldRoomId) {
          const oldRoom = rooms.get(oldRoomId);
          if (oldRoom) {
            oldRoom.participants.delete(socketId);
            broadcastAll(wss, oldRoomId, "participants-update", Array.from(oldRoom.participants.values()));
          }
        }

        socketToRoom.set(socketId, roomId);
        socketToUser.set(socketId, userId);

        // Use userId-based deduplication: remove any old socket for the same userId
        for (const [sid, participant] of room.participants.entries()) {
          if (participant.userId === userId && sid !== socketId) {
            room.participants.delete(sid);
          }
        }

        const color = AVATAR_COLORS[socketCounter % AVATAR_COLORS.length];
        room.participants.set(socketId, { socketId, userId, userName, avatarColor: color, joinedAt: Date.now() });

        if (!room.hostSocketId || !room.participants.has(room.hostSocketId)) {
          room.hostSocketId = socketId;
        }

        send(ws, "room-joined", {
          room: getRoomPublic(room),
          isHost: room.hostSocketId === socketId,
          currentPosition: getCurrentPosition(room),
          socketId,
        });

        broadcastAll(wss, roomId, "participants-update", Array.from(room.participants.values()));
        return;
      }

      const roomId = socketToRoom.get(socketId);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;
      const userId = socketToUser.get(socketId);

      const isOwner = room.hostSocketId === socketId ||
        (room.currentTrack && room.currentTrack.addedBy === userId);

      if (type === "play-track") {
        if (!isOwner) return;
        const track: Track = data;
        room.currentTrack = track;
        room.isPlaying = true;
        room.position = 0;
        room.positionSetAt = Date.now();
        broadcastAll(wss, roomId, "track-changed", { track, position: 0 });
      }

      else if (type === "add-to-queue") {
        const track: Track = data;
        room.queue.push(track);
        broadcastAll(wss, roomId, "queue-updated", room.queue);
        if (!room.currentTrack) {
          const next = room.queue.shift()!;
          room.currentTrack = next;
          room.isPlaying = true;
          room.position = 0;
          room.positionSetAt = Date.now();
          broadcastAll(wss, roomId, "track-changed", { track: next, position: 0 });
          broadcastAll(wss, roomId, "queue-updated", room.queue);
        }
      }

      else if (type === "pause") {
        if (!isOwner) return;
        room.position = getCurrentPosition(room);
        room.positionSetAt = Date.now();
        room.isPlaying = false;
        broadcastAll(wss, roomId, "playback-state", { isPlaying: false, position: room.position });
      }

      else if (type === "resume") {
        if (!isOwner) return;
        room.isPlaying = true;
        room.positionSetAt = Date.now();
        broadcastAll(wss, roomId, "playback-state", { isPlaying: true, position: room.position });
      }

      else if (type === "seek") {
        if (!isOwner) return;
        room.position = data.position;
        room.positionSetAt = Date.now();
        broadcastAll(wss, roomId, "seek", { position: data.position });
      }

      else if (type === "skip-track") {
        if (!isOwner) return;
        const next = room.queue.shift() || null;
        room.currentTrack = next;
        room.position = 0;
        room.positionSetAt = Date.now();
        room.isPlaying = !!next;
        broadcastAll(wss, roomId, "track-changed", { track: next, position: 0 });
        broadcastAll(wss, roomId, "queue-updated", room.queue);
      }

      else if (type === "vote-skip") {
        broadcastAll(wss, roomId, "skip-vote", { voterId: userId, voterName: data.userName });
      }

      else if (type === "request-sync") {
        send(ws, "sync", {
          currentTrack: room.currentTrack,
          isPlaying: room.isPlaying,
          position: getCurrentPosition(room),
          queue: room.queue,
          hostSocketId: room.hostSocketId,
        });
      }

      else if (type === "position-update") {
        if (room.hostSocketId !== socketId) return;
        room.position = data.position;
        room.positionSetAt = Date.now();
        broadcast(wss, roomId, "position-sync", { position: data.position }, ws);
      }

      else if (type === "get-rooms") {
        const publicRooms = Array.from(rooms.values()).map(r => ({
          id: r.id,
          name: r.name,
          isPrivate: r.isPrivate,
          participantCount: r.participants.size,
          currentTrack: r.currentTrack,
          createdBy: r.createdBy,
        }));
        send(ws, "rooms-list", publicRooms);
      }

      else if (type === "delete-room") {
        const { roomId: targetRoomId } = data;
        const targetRoom = rooms.get(targetRoomId);
        if (!targetRoom) return;
        if (targetRoomId === "general") return;
        if (targetRoom.createdBy !== userId) return;

        rooms.delete(targetRoomId);
        // Move all participants out
        for (const [sid] of targetRoom.participants) {
          socketToRoom.delete(sid);
        }
        broadcastAll(wss, targetRoomId, "room-deleted", { roomId: targetRoomId });
      }
    });

    ws.on("close", () => {
      const roomId = socketToRoom.get(socketId);
      socketToRoom.delete(socketId);
      socketToUser.delete(socketId);

      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;

      room.participants.delete(socketId);
      if (room.hostSocketId === socketId && room.participants.size > 0) {
        room.hostSocketId = Array.from(room.participants.keys())[0];
        broadcastAll(wss, roomId, "host-changed", { hostSocketId: room.hostSocketId });
      }
      broadcastAll(wss, roomId, "participants-update", Array.from(room.participants.values()));
    });
  });
}

export function getRooms() {
  return Array.from(rooms.values()).map(r => ({
    id: r.id,
    name: r.name,
    isPrivate: r.isPrivate,
    participantCount: r.participants.size,
    currentTrack: r.currentTrack,
    createdBy: r.createdBy,
    createdAt: r.createdAt,
  }));
}

export function createRoom(id: string, name: string, createdBy: string, password?: string): Room {
  const room: Room = {
    id,
    name,
    password,
    isPrivate: !!password,
    currentTrack: null,
    queue: [],
    isPlaying: false,
    position: 0,
    positionSetAt: Date.now(),
    participants: new Map(),
    hostSocketId: "",
    createdBy,
    createdAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

export function deleteRoom(roomId: string, userId: string): boolean {
  if (roomId === "general") return false;
  const room = rooms.get(roomId);
  if (!room) return false;
  if (room.createdBy !== userId) return false;
  rooms.delete(roomId);
  return true;
}
