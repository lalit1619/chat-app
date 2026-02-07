import { useState } from "react";
import { searchUsers, sendFriendRequest } from "../api/friends";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    setQuery(e.target.value);
    if (!e.target.value) return setResults([]);

    const res = await searchUsers(e.target.value);
    setResults(res.data);
  };

  const handleAdd = async (id) => {
    await sendFriendRequest(id);
    setResults((prev) => prev.filter((u) => u._id !== id));
  };

  return (
    <div className="p-3 border-b">
      <input
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        className="w-full border rounded px-3 py-2"
      />

      {results.map((user) => (
        <div key={user._id} className="flex justify-between mt-2">
          <span>{user.username}</span>
          <button
            onClick={() => handleAdd(user._id)}
            className="text-blue-600 text-sm"
          >
            Add
          </button>
        </div>
      ))}
    </div>
  );
}
