import { useState } from "react";

const ChatTest = () => {
  const [query, setQuery] = useState<string>(""); // User's query
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; content: string }[]
  >([]); // Array of messages
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [connectToFirstChunkTime, setConnectToFirstChunkTime] = useState<
    number | null
  >(null); // Time from connection established to first chunk received
  const [responseTime, setResponseTime] = useState<number | null>(null); // Total response time

  const handleSendQuery = async () => {
    if (!query.trim()) {
      alert("Please enter a query!");
      return;
    }

    // Reset states
    setConnectToFirstChunkTime(null);
    setResponseTime(null);
    setMessages((prev) => [...prev, { sender: "user", content: query }]);
    setQuery(""); // Clear the input field
    setIsLoading(true);

    const connectionStartTime = Date.now(); // Start tracking connection time
    let connectionEstablishedTime: number | null = null; // Time for connection established

    try {
      // Send the POST request and handle streaming
      const response = await fetch("http://localhost:8000/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          agentId: 10, // Replace with the appropriate agentId
          sessionId: "efd4b6fd-0d1e-4294-94c6-f1fad1a60cd0", // Replace with the appropriate sessionId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Process the readable stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      let botMessage = ""; // Accumulate the bot's response
      let firstChunkTime: number | null = null; // Time for the first chunk

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break; // End of stream

          const currentTime = Date.now(); // Current time for this chunk

          const chunk = decoder.decode(value, { stream: true });

          // Remove "data: " prefix and clean up chunk
          const cleanedChunk = chunk.replace(/^data:\s*/gm, "").trim();

          // Detect "Connection Established" message
          if (
            cleanedChunk.toLowerCase().includes("connection established") &&
            !connectionEstablishedTime
          ) {
            connectionEstablishedTime = currentTime; // Mark the connection established time
            continue;
          }

          // Measure time from connection established to first chunk
          if (!firstChunkTime && connectionEstablishedTime) {
            firstChunkTime = currentTime; // Record the time for the first chunk
            setConnectToFirstChunkTime(
              firstChunkTime - connectionEstablishedTime
            ); // Calculate and set the time from connection established to first chunk
          }

          botMessage += cleanedChunk; // Append the chunk

          // Update the bot's message in real time
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.sender === "bot") {
              return [
                ...prev.slice(0, -1),
                { sender: "bot", content: botMessage },
              ];
            } else {
              return [...prev, { sender: "bot", content: botMessage }];
            }
          });
        }
      }

      const endTime = Date.now(); // Stop tracking total response time
      setResponseTime(endTime - connectionStartTime); // Calculate total response time
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while streaming the response.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Chat Test</h2>
      <div
        style={{
          marginBottom: "10px",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          backgroundColor: "#f9f9f9",
          minHeight: "300px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                backgroundColor: msg.sender === "user" ? "#007bff" : "#f1f0f0",
                color: msg.sender === "user" ? "white" : "black",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your query here..."
        rows={2}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
        }}
        disabled={isLoading}
      ></textarea>
      <button
        onClick={handleSendQuery}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? "gray" : "blue",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Loading..." : "Send"}
      </button>
      {connectToFirstChunkTime !== null && (
        <div style={{ marginTop: "10px", color: "gray", fontSize: "14px" }}>
          <strong>Time to First Chunk (from Connection Established):</strong>{" "}
          {connectToFirstChunkTime} ms
        </div>
      )}
      {responseTime !== null && (
        <div style={{ marginTop: "10px", color: "gray", fontSize: "14px" }}>
          <strong>Total Response Time:</strong> {responseTime} ms
        </div>
      )}
    </div>
  );
};

export default ChatTest;
