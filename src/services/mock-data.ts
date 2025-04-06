
import { Band, User } from "@/types";

// Mock current user
export const currentUser: User = {
  id: "user1",
  name: "Jane Smith",
  email: "jane@example.com",
  avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff",
  instruments: ["Guitar", "Vocals"]
};

// Mock bands
export const mockBands: Band[] = [
  {
    id: "band1",
    name: "Midnight Groove",
    description: "Jazz fusion band with a modern twist",
    members: [
      {
        userId: "user1",
        name: "Jane Smith",
        role: "leader",
        avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff",
        instruments: ["Guitar", "Vocals"],
        availability: [
          new Date(2025, 3, 8), 
          new Date(2025, 3, 9), 
          new Date(2025, 3, 10),
          new Date(2025, 3, 15),
          new Date(2025, 3, 16)
        ]
      },
      {
        userId: "user2",
        name: "Alex Johnson",
        role: "member",
        avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=8b5cf6&color=fff",
        instruments: ["Bass"],
        availability: [
          new Date(2025, 3, 8), 
          new Date(2025, 3, 9),
          new Date(2025, 3, 16),
          new Date(2025, 3, 17)
        ]
      },
      {
        userId: "user3",
        name: "Olivia Williams",
        role: "member",
        avatar: "https://ui-avatars.com/api/?name=Olivia+Williams&background=8b5cf6&color=fff",
        instruments: ["Drums"],
        availability: [
          new Date(2025, 3, 9), 
          new Date(2025, 3, 10), 
          new Date(2025, 3, 15),
          new Date(2025, 3, 16),
          new Date(2025, 3, 17)
        ]
      }
    ],
    events: [
      {
        id: "event1",
        bandId: "band1",
        title: "Rehearsal",
        description: "Weekly rehearsal at the studio",
        startTime: new Date(2025, 3, 9, 19, 0),
        endTime: new Date(2025, 3, 9, 22, 0),
        location: "Sonic Studio, Room 3",
        attendees: ["user1", "user2", "user3"],
        createdBy: "user1",
        createdAt: new Date(2025, 3, 2)
      },
      {
        id: "event2",
        bandId: "band1",
        title: "Live at Jazz Lounge",
        description: "Performance at downtown jazz lounge",
        startTime: new Date(2025, 3, 16, 20, 0),
        endTime: new Date(2025, 3, 16, 23, 0),
        location: "The Jazz Lounge",
        attendees: ["user1", "user2", "user3"],
        createdBy: "user1",
        createdAt: new Date(2025, 3, 3)
      }
    ],
    createdAt: new Date(2025, 2, 15)
  },
  {
    id: "band2",
    name: "Electric Symphony",
    description: "Electronic rock ensemble",
    members: [
      {
        userId: "user1",
        name: "Jane Smith",
        role: "member",
        avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff",
        instruments: ["Guitar"],
        availability: [
          new Date(2025, 3, 8), 
          new Date(2025, 3, 10), 
          new Date(2025, 3, 15),
          new Date(2025, 3, 17)
        ]
      },
      {
        userId: "user4",
        name: "Michael Brown",
        role: "leader",
        avatar: "https://ui-avatars.com/api/?name=Michael+Brown&background=8b5cf6&color=fff",
        instruments: ["Keyboards", "Synth"],
        availability: [
          new Date(2025, 3, 10), 
          new Date(2025, 3, 11), 
          new Date(2025, 3, 17),
          new Date(2025, 3, 18)
        ]
      },
      {
        userId: "user5",
        name: "Sophie Chen",
        role: "member",
        avatar: "https://ui-avatars.com/api/?name=Sophie+Chen&background=8b5cf6&color=fff",
        instruments: ["Drums", "Percussion"],
        availability: [
          new Date(2025, 3, 10), 
          new Date(2025, 3, 11), 
          new Date(2025, 3, 15),
          new Date(2025, 3, 17),
          new Date(2025, 3, 18)
        ]
      }
    ],
    events: [
      {
        id: "event3",
        bandId: "band2",
        title: "Studio Session",
        description: "Recording session for new EP",
        startTime: new Date(2025, 3, 10, 13, 0),
        endTime: new Date(2025, 3, 10, 18, 0),
        location: "Soundwave Studios",
        attendees: ["user1", "user4", "user5"],
        createdBy: "user4",
        createdAt: new Date(2025, 3, 1)
      }
    ],
    createdAt: new Date(2025, 2, 20)
  }
];

// Mock data service functions
export const getBands = async (): Promise<Band[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBands);
    }, 500);
  });
};

export const getBandById = async (id: string): Promise<Band | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBands.find(band => band.id === id));
    }, 500);
  });
};

export const getCurrentUser = async (): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentUser);
    }, 500);
  });
};

export const getMemberAvailabilityForMonth = async (
  bandId: string,
  year: number,
  month: number
): Promise<{ [userId: string]: Date[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const band = mockBands.find(b => b.id === bandId);
      if (!band) {
        resolve({});
        return;
      }
      
      const result: { [userId: string]: Date[] } = {};
      band.members.forEach(member => {
        if (member.availability) {
          // Filter only dates from the specified month and year
          const filteredDates = member.availability.filter(date => 
            date.getFullYear() === year && date.getMonth() === month
          );
          result[member.userId] = filteredDates;
        }
      });
      
      resolve(result);
    }, 500);
  });
};

export const updateMemberAvailability = async (
  bandId: string,
  userId: string,
  dates: Date[]
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bandIndex = mockBands.findIndex(b => b.id === bandId);
      if (bandIndex === -1) {
        resolve(false);
        return;
      }
      
      const memberIndex = mockBands[bandIndex].members.findIndex(m => m.userId === userId);
      if (memberIndex === -1) {
        resolve(false);
        return;
      }
      
      // Update the member's availability
      mockBands[bandIndex].members[memberIndex].availability = dates;
      
      resolve(true);
    }, 500);
  });
};

export const createEvent = async (
  bandId: string, 
  title: string,
  description: string,
  startTime: Date,
  endTime: Date,
  location: string,
  attendees: string[]
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const bandIndex = mockBands.findIndex(b => b.id === bandId);
      if (bandIndex === -1) {
        resolve(false);
        return;
      }
      
      const newEvent = {
        id: `event${Math.floor(Math.random() * 10000)}`,
        bandId,
        title,
        description,
        startTime,
        endTime,
        location,
        attendees,
        createdBy: currentUser.id,
        createdAt: new Date()
      };
      
      mockBands[bandIndex].events.push(newEvent);
      
      resolve(true);
    }, 500);
  });
};
