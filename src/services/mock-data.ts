
import { Band, User, Event } from "@/types";

// Mock current user
export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder.svg",
  instruments: ["Guitar", "Vocals"]
};

// Mock users
export const mockUsers: User[] = [
  currentUser,
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatar: "/placeholder.svg",
    instruments: ["Bass"]
  },
  {
    id: "user-3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    avatar: "/placeholder.svg",
    instruments: ["Drums"]
  },
  {
    id: "user-4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    avatar: "/placeholder.svg",
    instruments: ["Piano", "Vocals"]
  },
  {
    id: "user-5",
    name: "Alex Brown",
    email: "alex.brown@example.com",
    avatar: "/placeholder.svg",
    instruments: ["Saxophone"]
  },
  {
    id: "user-6",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    avatar: "/placeholder.svg",
    instruments: ["Trumpet"]
  }
];

// Mock bands with events
export const mockBands: Band[] = [
  {
    id: "band-1",
    name: "The Rockers",
    description: "A high-energy rock band",
    members: [
      {
        userId: "user-1",
        name: "John Doe",
        role: "leader",
        avatar: "/placeholder.svg",
        instruments: ["Guitar", "Vocals"]
      },
      {
        userId: "user-2", 
        name: "Jane Smith",
        role: "member",
        avatar: "/placeholder.svg",
        instruments: ["Bass"]
      },
      {
        userId: "user-3",
        name: "Mike Johnson", 
        role: "member",
        avatar: "/placeholder.svg",
        instruments: ["Drums"]
      }
    ],
    events: [
      {
        id: "event-1",
        bandId: "band-1",
        title: "Summer Festival Gig",
        location: "Central Park Amphitheater",
        startTime: new Date(2024, 6, 15, 19, 0),
        eventType: "gig",
        attendees: ["user-1", "user-2", "user-3"],
        createdBy: "user-1",
        createdAt: new Date(2024, 5, 1)
      },
      {
        id: "event-2", 
        bandId: "band-1",
        title: "Weekly Practice Session",
        location: "Studio B - Music Center",
        startTime: new Date(2024, 6, 8, 18, 0),
        eventType: "rehearsal",
        attendees: ["user-1", "user-2"],
        createdBy: "user-1",
        createdAt: new Date(2024, 5, 20)
      }
    ],
    createdAt: new Date(2025, 2, 15)
  },
  {
    id: "band-2",
    name: "Jazz Collective",
    description: "Smooth jazz ensemble",
    members: [
      {
        userId: "user-4",
        name: "Sarah Wilson",
        role: "leader", 
        avatar: "/placeholder.svg",
        instruments: ["Piano", "Vocals"]
      },
      {
        userId: "user-5",
        name: "Alex Brown",
        role: "member",
        avatar: "/placeholder.svg", 
        instruments: ["Saxophone"]
      },
      {
        userId: "user-6",
        name: "Emily Davis",
        role: "member",
        avatar: "/placeholder.svg",
        instruments: ["Trumpet"]
      }
    ],
    events: [
      {
        id: "event-3",
        bandId: "band-2", 
        title: "Blue Note Jazz Night",
        location: "Blue Note Jazz Club",
        startTime: new Date(2024, 6, 22, 20, 30),
        eventType: "gig",
        attendees: ["user-4", "user-5", "user-6"],
        createdBy: "user-4",
        createdAt: new Date(2024, 5, 15)
      }
    ],
    createdAt: new Date(2025, 2, 20)
  }
];

// Mock events
export const mockEvents: Event[] = [
  {
    id: "event-1",
    bandId: "band-1",
    title: "Summer Festival Gig",
    location: "Central Park Amphitheater",
    startTime: new Date(2024, 6, 15, 19, 0),
    eventType: "gig",
    attendees: ["user-1", "user-2", "user-3"],
    createdBy: "user-1",
    createdAt: new Date(2024, 5, 1),
  },
  {
    id: "event-2",
    bandId: "band-1",
    title: "Weekly Practice Session",
    location: "Studio B - Music Center",
    startTime: new Date(2024, 6, 8, 18, 0),
    eventType: "rehearsal",
    attendees: ["user-1", "user-2"],
    createdBy: "user-1",
    createdAt: new Date(2024, 5, 20),
  },
  {
    id: "event-3",
    bandId: "band-2",
    title: "Jazz Night at Blue Note",
    location: "Blue Note Jazz Club",
    startTime: new Date(2024, 6, 22, 20, 30),
    eventType: "gig",
    attendees: ["user-4", "user-5", "user-6"],
    createdBy: "user-4",
    createdAt: new Date(2024, 5, 15),
  },
];

// Mock data service functions
export const getBandsByUserId = (userId: string): Band[] => {
  return mockBands.filter(band => 
    band.members.some(member => member.userId === userId)
  );
};

export const getBandById = (bandId: string): Band | undefined => {
  return mockBands.find(band => band.id === bandId);
};

export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

export const getEventsByBandId = (bandId: string): Event[] => {
  return mockEvents.filter(event => event.bandId === bandId);
};

export const getUpcomingEvents = (bandId: string): Event[] => {
  const now = new Date();
  return getEventsByBandId(bandId)
    .filter(event => event.startTime > now)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

// Mock availability data
export const mockAvailability = [
  {
    userId: "user-1",
    bandId: "band-1", 
    dates: [
      new Date(2024, 6, 15),
      new Date(2024, 6, 16),
      new Date(2024, 6, 17),
      new Date(2024, 6, 22),
      new Date(2024, 6, 23),
      new Date(2024, 6, 24)
    ]
  },
  {
    userId: "user-2",
    bandId: "band-1",
    dates: [
      new Date(2024, 6, 15),
      new Date(2024, 6, 17), 
      new Date(2024, 6, 18),
      new Date(2024, 6, 22),
      new Date(2024, 6, 24),
      new Date(2024, 6, 25)
    ]
  },
  {
    userId: "user-3", 
    bandId: "band-1",
    dates: [
      new Date(2024, 6, 16),
      new Date(2024, 6, 17),
      new Date(2024, 6, 18),
      new Date(2024, 6, 23),
      new Date(2024, 6, 24),
      new Date(2024, 6, 25)
    ]
  }
];

export const getAvailabilityByBandId = (bandId: string) => {
  return mockAvailability.filter(availability => availability.bandId === bandId);
};

export const updateUserAvailability = (userId: string, bandId: string, dates: Date[]) => {
  const existingIndex = mockAvailability.findIndex(
    availability => availability.userId === userId && availability.bandId === bandId
  );
  
  if (existingIndex >= 0) {
    mockAvailability[existingIndex].dates = dates;
  } else {
    mockAvailability.push({ userId, bandId, dates });
  }
};

export const addMemberToBand = (bandId: string, user: User, role: "leader" | "member" = "member") => {
  const band = getBandById(bandId);
  if (band) {
    const newMember = {
      userId: user.id,
      name: user.name,
      role,
      avatar: user.avatar,
      instruments: user.instruments
    };
    band.members.push(newMember);
  }
};

export const createMockBand = (name: string, createdBy: string): Band => {
  const creator = getUserById(createdBy);
  return {
    id: `band-${Date.now()}`,
    name,
    members: creator ? [{
      userId: creator.id,
      name: creator.name,
      role: "leader",
      avatar: creator.avatar,
      instruments: creator.instruments
    }] : [],
    events: [],
    createdAt: new Date()
  };
};

export const createMockEvent = (data: Partial<Event>): Event => ({
  id: data.id || `event-${Date.now()}`,
  bandId: data.bandId || "band-1",
  title: data.title || "New Event",
  location: data.location || "TBD",
  startTime: data.startTime || new Date(),
  eventType: data.eventType || "rehearsal",
  attendees: data.attendees || [],
  createdBy: data.createdBy || "user-1",
  createdAt: data.createdAt || new Date(),
});
