export default function MessageBubble({ msg, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-xl max-w-xs text-sm
          ${
            mine
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
      >
        {msg.content}
      </div>
    </div>
  );
}
