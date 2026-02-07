import { useEffect, useState } from "react";
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../api/friends";

export default function FriendRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    getFriendRequests().then((res) => setRequests(res.data));
  }, []);

  const accept = async (id) => {
    await acceptFriendRequest(id);
    setRequests((prev) => prev.filter((r) => r._id !== id));
  };

  const reject = async (id) => {
    await rejectFriendRequest(id);
    setRequests((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="p-3 border-b">
      <h3 className="font-semibold mb-2">Requests</h3>

      {requests.map((user) => (
        <div key={user._id} className="flex justify-between mb-2">
          <span>{user.username}</span>
          <div className="space-x-2">
            <button
              onClick={() => accept(user._id)}
              className="text-green-600 text-sm"
            >
              Accept
            </button>
            <button
              onClick={() => reject(user._id)}
              className="text-red-600 text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
