import { useEffect, useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import { getMessages } from "../api/messages";

export default function ChatWindow({ socket, selectedUser, myId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Typing indicator
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const bottomRef = useRef(null);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!selectedUser) return;

    setMessages([]); // reset when switching users

    getMessages(selectedUser._id)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));
  }, [selectedUser]);

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const receiveMessageHandler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const typingHandler = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };

    const stopTypingHandler = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    const chatErrorHandler = (data) => {
      alert(data.error);
    };

    socket.on("receive_message", receiveMessageHandler);
    socket.on("typing", typingHandler);
    socket.on("stop_typing", stopTypingHandler);
    socket.on("chat_error", chatErrorHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
      socket.off("typing", typingHandler);
      socket.off("stop_typing", stopTypingHandler);
      socket.off("chat_error", chatErrorHandler);
    };
  }, [socket, selectedUser]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    socket.emit("send_message", {
      senderId: myId,
      receiverId: selectedUser._id,
      content: text,
    });

    socket.emit("stop_typing", {
      senderId: myId,
      receiverId: selectedUser._id,
    });

    setText("");
  };

  /* ---------------- INPUT CHANGE ---------------- */
  const handleChange = (e) => {
    setText(e.target.value);

    socket.emit("typing", {
      senderId: myId,
      receiverId: selectedUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: myId,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  /* ---------------- ENTER KEY ---------------- */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 font-semibold">
        {selectedUser.username.charAt(0).toUpperCase() +
          selectedUser.username.slice(1)}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id || i}
            msg={msg}
            mine={msg.senderId === myId}
          />
        ))}

        {isTyping && (
          <p className="text-sm text-gray-500 italic">
            {selectedUser.username} is typing...
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 flex gap-2">
        <input
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
