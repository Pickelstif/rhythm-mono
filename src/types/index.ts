export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  instruments?: string[];
};

export type Band = {
  id: string;
  name: string;
  description?: string;
  members: BandMember[];
  events: Event[];
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
  instruments: string[];
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}
