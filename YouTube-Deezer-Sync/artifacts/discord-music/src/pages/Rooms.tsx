import { useEffect, useState } from "react";
import { useMusic } from "../context/MusicContext";
import { DoorOpen, Plus, Lock, Users, Music, ChevronRight, X, Eye, EyeOff, Trash2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Rooms() {
  const { rooms, fetchRooms, joinRoom, createRoom, deleteRoom, currentRoomId, participants, t, userId } = useMusic();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) { setError("Nombre requerido"); return; }
    setCreating(true);
    setError("");
    try {
      await createRoom(roomName.trim(), roomPassword || undefined);
      setShowCreate(false);
      setRoomName("");
      setRoomPassword("");
      fetchRooms();
    } catch {
      setError("Error al crear la sala");
    }
    setCreating(false);
  };

  const handleJoin = (roomId: string, isPrivate: boolean) => {
    if (isPrivate) {
      setShowJoin(roomId);
    } else {
      joinRoom(roomId);
    }
  };

  const handleJoinWithPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (showJoin) {
      joinRoom(showJoin, joinPassword);
      setShowJoin(null);
      setJoinPassword("");
    }
  };

  const handleDelete = async (roomId: string) => {
    setDeleting(true);
    const success = await deleteRoom(roomId);
    setDeleting(false);
    setShowDeleteConfirm(null);
    if (success) {
      fetchRooms();
    }
  };

  const allRooms = [
    { id: 'general', name: t('generalRoom'), isPrivate: false, participantCount: participants.length, currentTrack: null, createdBy: 'system' },
    ...rooms.filter(r => r.id !== 'general'),
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <DoorOpen className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('rooms')}</h1>
            <p className="text-sm text-muted-foreground">{t('generalRoom')} + {t('privateRooms')}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('createRoom')}
        </Button>
      </div>

      {/* Create Room Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{t('createRoomTitle')}</h2>
                <p className="text-sm text-muted-foreground">{t('createRoomDesc')}</p>
              </div>
              <button onClick={() => { setShowCreate(false); setError(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('roomName')}</label>
                <Input
                  placeholder="Mi Sala..."
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('roomPassword')}</label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="Dejar vacío = sala pública"
                    value={roomPassword}
                    onChange={e => setRoomPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {roomPassword && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Esta sala será privada
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowCreate(false); setError(""); }}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={creating}>
                  {creating ? t('loading') : t('createRoom')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join private room modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('joinPrivateRoom')}</h2>
              <button onClick={() => setShowJoin(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJoinWithPass} className="space-y-4">
              <Input
                type="password"
                placeholder={t('enterPassword')}
                value={joinPassword}
                onChange={e => setJoinPassword(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowJoin(null)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="flex-1">{t('joinRoom')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-popover border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-base font-bold">Eliminar sala</h2>
                <p className="text-xs text-muted-foreground">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              ¿Seguro que quieres eliminar "<span className="font-medium text-foreground">{allRooms.find(r => r.id === showDeleteConfirm)?.name}</span>"?
              Todos los participantes serán movidos a la Sala General.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>
                {t('cancel')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={deleting}
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                {deleting ? t('loading') : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms list */}
      <div className="space-y-3">
        {allRooms.map(room => {
          const isActive = room.id === currentRoomId;
          const isOwner = room.createdBy === userId && room.id !== 'general';
          return (
            <div
              key={room.id}
              className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${isActive ? 'bg-primary/10 border-primary/40' : 'bg-card/40 border-border/30 hover:border-primary/20 hover:bg-card/60'}`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 rounded-r-full bg-primary" />}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/20' : 'bg-muted'}`}>
                {room.isPrivate ? <Lock className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} /> : <DoorOpen className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${isActive ? 'text-primary' : ''}`}>{room.name}</p>
                  {room.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                  {isActive && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Actual</span>}
                  {isOwner && <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">Tuya</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.participantCount} {t('participants')}</span>
                  {room.currentTrack && (
                    <span className="flex items-center gap-1 truncate">
                      <Music className="w-3 h-3 text-primary" />
                      <span className="truncate">{room.currentTrack.title}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    onClick={() => setShowDeleteConfirm(room.id)}
                    className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar sala"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {!isActive && (
                  <button
                    onClick={() => handleJoin(room.id, room.isPrivate)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
                  >
                    {t('joinRoom')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {rooms.filter(r => r.id !== 'general').length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Lock className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">{t('noRooms')}</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              {t('createFirstRoom')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
