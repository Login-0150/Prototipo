export type Platform = 'spotify' | 'youtube' | 'deezer' | 'radio' | 'all';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  duration: number; // in seconds
  platform: Platform;
}

export interface RadioStation {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  genre: string;
  listeners: number;
  logo: string;
  platform: 'radio';
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverArt?: string;
  tracks: Track[];
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
}

export const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: 'Alex', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isHost: true },
  { id: '2', name: 'Sarah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', isHost: false },
  { id: '3', name: 'Mike', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', isHost: false },
  { id: '4', name: 'Emma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', isHost: false },
  { id: '5', name: 'David', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', isHost: false },
];

export const MOCK_TRACKS: Track[] = [
  { id: 't1', title: 'Midnight City', artist: 'M83', duration: 243, platform: 'spotify' },
  { id: 't2', title: 'Starboy', artist: 'The Weeknd', duration: 230, platform: 'spotify' },
  { id: 't3', title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, platform: 'youtube' },
  { id: 't4', title: 'Levitating', artist: 'The Weeknd', duration: 203, platform: 'deezer' },
  { id: 't5', title: 'Get Lucky', artist: 'Dua Lipa', duration: 249, platform: 'spotify' },
  { id: 't6', title: 'Lose Yourself', artist: 'Daft Punk', duration: 369, platform: 'youtube' },
  { id: 't7', title: 'Instant Crush', artist: 'Daft Punk', duration: 338, platform: 'deezer' },
  { id: 't8', title: 'Stressed Out', artist: 'Eminem', duration: 326, platform: 'spotify' },
  { id: 't9', title: 'Without Me', artist: 'Eminem', duration: 290, platform: 'youtube' },
  { id: 't10', title: 'Till I Collapse', artist: 'Eminem', duration: 297, platform: 'deezer' },
  { id: 't11', title: 'Rap God', artist: 'Eminem', duration: 363, platform: 'spotify' },
  { id: 't12', title: 'The Real Slim Shady', artist: 'Eminem', duration: 284, platform: 'youtube' },
  { id: 't13', title: 'Not Afraid', artist: 'Eminem', duration: 248, platform: 'deezer' },
  { id: 't14', title: 'Love the Way You Lie', artist: 'Eminem', duration: 263, platform: 'spotify' },
  { id: 't15', title: 'Mockingbird', artist: 'Eminem', duration: 250, platform: 'youtube' },
  { id: 't16', title: 'Smack That', artist: 'Akon', duration: 212, platform: 'deezer' },
  { id: 't17', title: 'Lonely', artist: 'Akon', duration: 235, platform: 'spotify' },
  { id: 't18', title: 'Right Now (Na Na Na)', artist: 'Akon', duration: 241, platform: 'youtube' },
  { id: 't19', title: 'Beautiful', artist: 'Akon', duration: 313, platform: 'deezer' },
  { id: 't20', title: 'I Wanna Love You', artist: 'Akon', duration: 247, platform: 'spotify' },
];

export const MOCK_RADIOS: RadioStation[] = [
  { id: 'r1', name: 'BBC Radio 1', country: 'United Kingdom', countryCode: 'GB', genre: 'Pop', listeners: 15200, logo: 'BBC', platform: 'radio' },
  { id: 'r2', name: 'KEXP 90.3', country: 'United States', countryCode: 'US', genre: 'Alternative', listeners: 8500, logo: 'KEXP', platform: 'radio' },
  { id: 'r3', name: 'NTS Radio', country: 'United Kingdom', countryCode: 'GB', genre: 'Eclectic', listeners: 6200, logo: 'NTS', platform: 'radio' },
  { id: 'r4', name: 'SomaFM - Groove Salad', country: 'United States', countryCode: 'US', genre: 'Ambient', listeners: 12400, logo: 'SomaFM', platform: 'radio' },
  { id: 'r5', name: 'Rinse FM', country: 'United Kingdom', countryCode: 'GB', genre: 'Electronic', listeners: 7100, logo: 'Rinse', platform: 'radio' },
  { id: 'r6', name: 'TSF Jazz', country: 'France', countryCode: 'FR', genre: 'Jazz', listeners: 4300, logo: 'TSF', platform: 'radio' },
  { id: 'r7', name: 'Radio Nova', country: 'France', countryCode: 'FR', genre: 'Hip Hop / Soul', listeners: 5600, logo: 'Nova', platform: 'radio' },
  { id: 'r8', name: 'J-WAVE 81.3', country: 'Japan', countryCode: 'JP', genre: 'J-Pop / Eclectic', listeners: 9800, logo: 'J-WAVE', platform: 'radio' },
  { id: 'r9', name: 'Triple J', country: 'Australia', countryCode: 'AU', genre: 'Alternative / Indie', listeners: 11200, logo: 'TripleJ', platform: 'radio' },
  { id: 'r10', name: 'Ibiza Global Radio', country: 'Spain', countryCode: 'ES', genre: 'Electronic / House', listeners: 14500, logo: 'Ibiza', platform: 'radio' },
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { id: 'p1', name: 'Late Night Drive', description: 'Perfect tracks for a midnight cruise.', tracks: [MOCK_TRACKS[0], MOCK_TRACKS[1], MOCK_TRACKS[2]] },
  { id: 'p2', name: 'Workout Pump', description: 'High energy tracks to get you moving.', tracks: [MOCK_TRACKS[10], MOCK_TRACKS[11], MOCK_TRACKS[12]] },
  { id: 'p3', name: 'Chill Vibes', description: 'Relaxing tunes for a Sunday afternoon.', tracks: [MOCK_TRACKS[4], MOCK_TRACKS[5], MOCK_TRACKS[6]] },
];

export const MOCK_HISTORY: Track[] = [
  MOCK_TRACKS[15],
  MOCK_TRACKS[16],
  MOCK_TRACKS[17],
  MOCK_TRACKS[18],
  MOCK_TRACKS[19],
];
