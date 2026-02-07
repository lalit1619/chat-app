import { useEffect, useState } from "react";
import io from "socket.io-client";
import UserSearch from "../components/userSearch";
import FriendRequests from "../components/friendRequests";
import ChatWindow from "../components/ChatWindow";
import { getFriends } from "../api/friends";
import { jwtDecode } from "jwt-decode";

const socket = io("http://localhost:5000");

export default function Chat() {
  const [friends, setFriends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const token = localStorage.getItem("token");
  const { id: myId, username } = jwtDecode(token);

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    socket.emit("user_online", myId);

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    return () => socket.off("online_users");
  }, [myId]);

  /* ---------- FRIENDS ---------- */
  const loadFriends = async () => {
    const res = await getFriends();
    setFriends(res.data);
  };

  useEffect(() => {
    loadFriends();
  }, []);

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-center">ChatApp</h1>
          <p className="text-sm text-gray-500 text-center">
            Welcome, {username}
          </p>
        </div>

        <UserSearch />
        <FriendRequests />

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="px-4 py-2 text-sm font-semibold text-gray-500">
            Chats
          </h3>

          {friends.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`px-4 py-3 cursor-pointer flex items-center justify-between
                ${
                  selectedUser?._id === user._id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
            >
              <span className="capitalize">{user.username}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  onlineUsers.includes(user._id)
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-4 border-t text-red-600 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

      {/* CHAT WINDOW */}
      <ChatWindow
        socket={socket}
        selectedUser={selectedUser}
        myId={myId}
      />
    </div>
  );
}
