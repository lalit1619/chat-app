import axios from "axios";

export const getMessages = (userId) =>
  axios.get(`http://localhost:5000/api/messages/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
