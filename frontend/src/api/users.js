import axios from "axios";

export const getUsers = () =>
  axios.get("http://localhost:5000/api/users", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
