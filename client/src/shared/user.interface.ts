export interface User {
  _id: string,
  username: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
  isEmailVerified: boolean;
  onlinePresence: string;
}

export interface UserPartial {
  _id: string,
  username: string,
  profilePicture: string,
  onlinePresence: string,
}