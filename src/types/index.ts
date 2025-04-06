
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
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: string[]; // array of user IDs
  createdBy: string; // user ID
  createdAt: Date;
};

export type AvailabilityInput = {
  userId: string;
  bandId: string;
  dates: Date[];
};
