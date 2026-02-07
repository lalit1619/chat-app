import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const searchUsers = (query) =>
  API.get(`/users/search?q=${query}`);

export const sendFriendRequest = (receiverId) =>
  API.post("/friends/request", { receiverId });

export const getFriendRequests = () =>
  API.get("/friends/requests");

export const acceptFriendRequest = (senderId) =>
  API.post("/friends/accept", { senderId });

export const rejectFriendRequest = (senderId) =>
  API.post("/friends/reject", { senderId });

export const getFriends = () =>
  API.get("/friends");
