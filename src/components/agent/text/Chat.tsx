import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { RiThumbDownFill, RiThumbUpFill } from "react-icons/ri";
import { MdOutlineContentCopy, MdCheck } from "react-icons/md";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { format, formatDistanceToNow } from "date-fns";
import API from "../../../utils/API";
import Button from "../../lib/Button";
import { LuLogs } from "react-icons/lu";
import { IoChatbubble } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  reaction?: number | null;
}

interface AgentSession {
  agentId: number;
  sessionId: string;
}


const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const [filteredSessionId, setFilteredSessionId] = useState<string | null>(null);
  const selectedAgentId = localStorage.getItem("selectedAgentId");
  const [agentName, setAgentName] = useState("Chatbot Agent"); // Default agent name

  useEffect(() => {
    const agents = JSON.parse(localStorage.getItem("agentSessions") || "[]");
    const filteredAgent = agents.filter((agent: AgentSession) => agent.agentId === Number(selectedAgentId));
    console.log(`filteredAgent: ${JSON.stringify(filteredAgent)}`);
    setFilteredSessionId(filteredAgent[0].sessionId);
    console.log(`Selected Agent ID: ${selectedAgentId}`);
    fetchMessages()
    fetchAgentName()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSessionId])

  // Fetch messages from the server
  const fetchMessages = async (isLoadMore = false) => {
    if (isFetching || (isLoadMore && page > totalPages)) return;
    setIsFetching(true);

    const currentScrollHeight = chatAreaRef.current?.scrollHeight || 0;

    try {
      if (!filteredSessionId) {
        console.warn("Filtered session ID is not set.");
        return;
      }

      const { data } = await API.get(`/chat/messages/${filteredSessionId}`, {
        params: { page: isLoadMore ? page + 1 : page, limit: 10 },
      });
      console.log(`Data: ${JSON.stringify(data)}`);

      setTotalPages(data.pagination.totalPages);

      const parsedMessages = data.messages.map((msg: { createdAt: string }) => ({
        ...msg,
        timestamp: new Date(msg.createdAt),
      }));

      setMessages((prev) => {
        const allMessages = isLoadMore
          ? [...parsedMessages, ...prev]
          : [...prev, ...parsedMessages];

        const uniqueMessages = allMessages.filter(
          (message, index, self) =>
            index === self.findIndex((m) => m.id === message.id)
        );

        return uniqueMessages;
      });

      if (isLoadMore) {
        setPage((prev) => prev + 1);
      }

      if (isLoadMore) {
        setTimeout(() => {
          if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop =
              chatAreaRef.current.scrollHeight - currentScrollHeight;
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle scrolling to the top for loading more messages
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = () => {
    if (!chatAreaRef.current || isFetching || page > totalPages) return;

    // Check if the user has scrolled to the top
    if (chatAreaRef.current.scrollTop === 0) {
      fetchMessages(true);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const userInput = input;
    setInput("");

    const typingMessage: Message = {
      id: uuidv4(),
      content: "Typing...",
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, typingMessage]);

    try {
      const { data } = await API.post("/chat/message", {
        agentId: parseInt(localStorage.getItem("selectedAgentId") || "1", 0),
        sessionId: filteredSessionId,
        query: userInput,
      });

      setMessages((prev) =>
        prev
          .filter((msg) => msg.content !== "Typing...")
          .concat({
            id: uuidv4(),
            content: data.data || "No response received.",
            sender: "bot",
            timestamp: new Date(),
          })
      );
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) =>
        prev
          .filter((msg) => msg.content !== "Typing...")
          .concat({
            id: uuidv4(),
            content: "Something went wrong. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          })
      );
    }
  };

  // Add a reaction to a message
  const handleReactionUpdate = async (messageId: string, reaction: number | null) => {
    try {
      await API.put(`/chat/messages/${messageId}/reaction`, { reaction });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, reaction } : msg
        )
      );
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  // Group messages by date
  const renderGroupedMessages = () => {
    const groupMessagesByDate = (messages: Message[]) => {
      return messages.reduce((acc: { [key: string]: Message[] }, message) => {
        const messageDate = format(message.timestamp, "yyyy-MM-dd");
        if (!acc[messageDate]) acc[messageDate] = [];
        acc[messageDate].push(message);
        return acc;
      }, {});
    };

    const groupedMessages = groupMessagesByDate(messages);

    return Object.keys(groupedMessages).map((date) => (
      <div key={date}>
        <div className="text-center text-gray-500 text-sm font-medium my-2">
          {format(new Date(date), "PPP")}
        </div>
        {groupedMessages[date].map((msg) => (
          <div key={msg.id} className="flex flex-col group my-2">
            <div
              className={`p-3 rounded-lg max-w-[75%] ${msg.sender === "user"
                ? "bg-blue-600 text-white self-end"
                : "bg-gray-200 text-black self-start"
                }`}
            >
              {msg.content}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              {msg.sender === "bot" && (
                <div className="hidden group-hover:flex space-x-2">
                  <button
                    onClick={() => handleCopyMessage(msg.content, msg.id)}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    {copiedMessageId === msg.id ? (
                      <MdCheck className="text-green-500" />
                    ) : (
                      <MdOutlineContentCopy />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleReactionUpdate(
                        msg.id,
                        msg.reaction === 1 ? null : 1
                      )
                    }
                    className={`${msg.reaction === 1
                      ? "text-blue-500"
                      : "text-gray-400 hover:text-blue-500"
                      }`}
                  >
                    <RiThumbUpFill />
                  </button>
                  <button
                    onClick={() =>
                      handleReactionUpdate(
                        msg.id,
                        msg.reaction === 0 ? null : 0
                      )
                    }
                    className={`${msg.reaction === 0
                      ? "text-red-500"
                      : "text-gray-400 hover:text-red-500"
                      }`}
                  >
                    <RiThumbDownFill />
                  </button>
                </div>
              )}
              <span>
                {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    ));
  };

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Add scroll listener
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (chatArea) {
      chatArea.addEventListener("scroll", handleScroll);
      return () => chatArea.removeEventListener("scroll", handleScroll);
    }
  }, [page, totalPages, isFetching, handleScroll]);

  const navigate = useNavigate();

  const navgiateTo = (path: string) => {
    // Any logic you want before navigating
    navigate(`${path}`);
  };


  const fetchAgentName = async () => {
    const storedAgentName = localStorage.getItem("agentName");

    if (storedAgentName) {
      // Use the stored agent name if available
      setAgentName(storedAgentName);
      return;
    }

    try {
      const { data } = await API.get(`/agent/getAgentNameById/${selectedAgentId}`);
      if (data.status === 1 && data.name) {
        setAgentName(data.name.trim()); // Update the agent name
        localStorage.setItem("agentName", data.name.trim()); // Save it to local storage
      }
    } catch (error) {
      console.error("Error fetching agent name:", error);
    }
  };


  return (
    <div>

      <div className="flex flex-col h-[700px] bg-gray-100 rounded-xl  mx-10 mt-10">
        <div className="p-4 bg-white shadow rounded-t-xl">
          <div className="flex items-center space-x-2 text-blue-600" onClick={() => navgiateTo('/configure-agent')}>
            <IoArrowBackOutline />
            <h2 className="text-lg font-bold">{agentName}</h2>
          </div>
          <span>Chtabot</span>
        </div>
        <div
          ref={chatAreaRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50"
        >
          {renderGroupedMessages()}
        </div>
        <div className="p-4 bg-white rounded-b-xl">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
              className="text-gray-500"
            >

            </button>
            {isEmojiPickerVisible && (
              <div className="absolute bottom-20">
                <EmojiPicker
                  emojiStyle={EmojiStyle.NATIVE}
                  onEmojiClick={(emoji) => setInput(input + emoji.emoji)}
                />
              </div>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Send
            </Button>
          </div>
        </div>


      </div>
      <div className="flex mx-9  space-x-3">
        <div onClick={() => navgiateTo('/reaction-logs')} className="text-center cursor-pointer hover:border-4 text-gray-500 mt-4 border p-4 rounded-xl  bg-white flex space-x-2 items-center">
          <LuLogs />
          <span>
            Open Reactions logs
          </span>
        </div>
        <div onClick={() => navgiateTo(`/c?id=552307895uvoi835735-${selectedAgentId}`)} className="text-center cursor-pointer hover:border-4 text-gray-500 mt-4 border p-4 rounded-xl  bg-white flex space-x-2 items-center">
          <IoChatbubble />

          <span>Open Chatbot</span>
        </div>
      </div>
    </div>
  );
};

export default Chat;
