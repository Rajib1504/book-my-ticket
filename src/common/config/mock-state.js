// In-memory mock storage for demo purposes when DB is unavailable
export const mockState = {
  users: [],
  seats: Array.from({ length: 60 }, (_, i) => ({
    id: i + 1,
    user_id: null,
    isbooked: 0,
    name: null, // For visual compatibility
  })),
  isDbDown: false,
};

export const getMockUserByEmail = (email) =>
  mockState.users.find((u) => u.email === email);

export const createMockUser = (name, email, password) => {
  const newUser = { id: mockState.users.length + 1, name, email, password };
  mockState.users.push(newUser);
  return newUser;
};

export const getMockSeats = () => {
  return mockState.seats.map((seat) => {
    const user = mockState.users.find((u) => u.id === seat.user_id);
    return {
      ...seat,
      name: user ? user.name : null,
    };
  });
};

export const bookMockSeat = (seatId, userId) => {
  const seat = mockState.seats.find((s) => s.id === parseInt(seatId));
  if (seat && seat.isbooked === 0) {
    seat.isbooked = 1;
    seat.user_id = userId;
    return true;
  }
  return false;
};
