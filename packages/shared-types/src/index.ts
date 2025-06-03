export type UserType = 'band' | 'organizer';

export type User = {
  id: string;
  name: string;
  email: string;
  user_type?: UserType;
  avatar?: string;
  instruments?: string[];
};

export type Band = {
  id: string;
  name: string;
  description?: string;
  members: BandMember[];
  events: Event[];
  songs?: Song[];
  createdAt: Date;
};

export type BandMember = {
  userId: string;
  name: string;
  role: "leader" | "member";
  avatar?: string;
  instruments?: string[];
  availability?: Date[];
};

export type Event = {
  id: string;
  bandId: string;
  title: string;
  location?: string;
  startTime: Date;
  eventType: 'rehearsal' | 'gig';
  attendees: string[]; // array of user IDs
  createdBy: string; // user ID
  createdAt: Date;
  setlist?: Setlist;
};

export type Song = {
  id: string;
  bandId: string;
  title: string;
  artist: string;
  spotifyLink?: string;
  songSheetPath?: string;
  createdBy: string; // user ID
  createdAt: Date;
};

export type AvailabilityInput = {
  userId: string;
  bandId: string;
  dates: Date[];
};

export interface Instrument {
  id: string;
  name: string;
  type: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  practiceReminders: boolean;
  newCollaborationRequests: boolean;
  messageNotifications: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  user_type?: UserType;
  instruments: string[];
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}

export type Setlist = {
  id: string;
  eventId: string;
  songs: SetlistSong[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SetlistSong = {
  id: string;
  setlistId: string;
  songId: string;
  position: number;
  notes?: string;
  song?: Song;
  createdAt: Date;
};
