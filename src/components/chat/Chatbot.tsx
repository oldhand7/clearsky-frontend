/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import Button from "../lib/Button";
import { RiThumbDownFill, RiThumbUpFill } from "react-icons/ri";
import { MdCheck, MdClose, MdOutlineContentCopy } from "react-icons/md";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react"; // Import the emoji picker library

import {
  AttachmentIcon,
  ChatbotPopUp,
  ChatExtendIcon,
  EmojiSelectorIcon,
  MessagesBubble,
  MessageSendIcon,
} from "../../assets/icons/Icons";
import { v4 as uuidv4 } from "uuid";
import API from "../../utils/API";
import { format, formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  reaction?: number | null;
};

const ChatbotPopup: React.FC = () => {
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false); // State to toggle emoji picker

  const [isVisible, setIsVisible] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; content: string; sender: string; timestamp: Date }[]
  >([]);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [agentName, setAgentName] = useState("Clearsky Agent"); // Default agent name
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null); // State to track copied message ID


  const sessionId = localStorage.getItem("sessionId") || uuidv4();
  const agentId = (() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      const parts = id.split("-");
      const numericId = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(numericId)) {
        return numericId;
      }
    }
    return null;
  })();

  useEffect(() => {
    localStorage.setItem("sessionId", sessionId);
    fetchAgentName(); // Fetch agent name on component mount
    fetchMessages(false);
  }, []);

  const fetchAgentName = async () => {
    const storedAgentName = localStorage.getItem("agentName");

    if (storedAgentName) {
      // Use the stored agent name if available
      setAgentName(storedAgentName);
      return;
    }

    try {
      const { data } = await API.get(`/agent/getAgentNameById/${agentId}`);
      if (data.status === 1 && data.name) {
        setAgentName(data.name.trim()); // Update the agent name
        localStorage.setItem("agentName", data.name.trim()); // Save it to local storage
      }
    } catch (error) {
      console.error("Error fetching agent name:", error);
    }
  };

  const fetchMessages = async (isLoadMore = false) => {
    if (isFetching || (isLoadMore && page > totalPages)) return;
    setIsFetching(true);

    const currentScrollHeight = chatAreaRef.current?.scrollHeight || 0;

    try {
      const { data } = await API.get(`/chat/messages/${sessionId}`, {
        params: { page: isLoadMore ? page + 1 : page, limit: 10 },
      });

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

      setTimeout(() => {
        if (chatAreaRef.current) {
          chatAreaRef.current.scrollTop =
            chatAreaRef.current.scrollHeight - currentScrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), content: input, sender: "user", timestamp: new Date() },
      ]);

      const userInput = input;
      setInput("");

      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), content: "Typing...", sender: "bot", timestamp: new Date() },
      ]);

      const { data } = await API.post("/chat/message", {
        agentId,
        sessionId,
        query: userInput,
      });

      setMessages((prev) => {
        const updatedMessages = prev.filter((msg) => msg.content !== "Typing...");
        return [
          ...updatedMessages,
          {
            id: uuidv4(),
            content: data.data || "No response received.",
            sender: "bot",
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error("Error fetching response:", error);

      setMessages((prev) => {
        const updatedMessages = prev.filter((msg) => msg.content !== "Typing...");
        return [
          ...updatedMessages,
          {
            id: uuidv4(),
            content: "Something went wrong. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          },
        ];
      });
    }
  };


  // Update the reaction for a specific message
  const handleReactionUpdate = async (messageId: string, reaction: number | null) => {
    try {
      // Call the backend API to update the reaction
      await API.put(`/chat/messages/${messageId}/reaction`, { reaction });

      // Update the message locally to reflect the change
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, reaction } : msg
        )
      );
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };


  const togglePopup = () => setIsVisible(!isVisible);
  const toggleExtend = () => setIsExtended(!isExtended);

  const handleScroll = () => {
    if (!chatAreaRef.current || isFetching || page > totalPages) return;

    const { scrollTop } = chatAreaRef.current;

    if (scrollTop <= 50) {
      fetchMessages(true);
    }
  };

  const groupMessagesByDate = (
    messages: Message[]
  ): Record<string, Message[]> => {
    // 3. Provide a typed initial object to reduce into
    const grouped = messages.reduce<Record<string, Message[]>>(
      (acc, message) => {
        const messageDate = format(message.timestamp, "yyyy-MM-dd");
        if (!acc[messageDate]) {
          acc[messageDate] = [];
        }
        acc[messageDate].push(message);
        return acc;
      },
      {}
    );
  
    return grouped;
  };

  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setInput((prev) => prev + emojiObject.emoji); // Append emoji to the input field
    setIsEmojiPickerVisible(false); // Close the emoji picker
  };


  const renderGroupedMessages = () => {
    const groupedMessages = groupMessagesByDate(messages);

    const handleCopyMessage = (content: string, messageId: string) => {
      navigator.clipboard.writeText(content).then(() => {
        setCopiedMessageId(messageId); // Set the copied message ID
        setTimeout(() => setCopiedMessageId(null), 2000); // Reset the state after 2 seconds
      });
    };

    return Object.keys(groupedMessages).map((date) => {
      const isToday = format(new Date(), "yyyy-MM-dd") === date;
      const isYesterday =
        format(new Date(Date.now() - 24 * 60 * 60 * 1000), "yyyy-MM-dd") === date;

      let dateLabel = date;
      if (isToday) dateLabel = "Today";
      if (isYesterday) dateLabel = "Yesterday";

      return (
        <div key={date} className="space-y-4">
          <div className="text-center text-gray-500 text-sm font-medium my-2">
            {dateLabel}
          </div>
          {groupedMessages[date].map((msg) => (
            <div key={msg.id} className="flex flex-col group">
              <div
                className={`p-2 rounded-lg max-w-[80%] ${msg.sender === "user"
                  ? "bg-blue-700 text-white self-end text-[13px]"
                  : "bg-[#9EB793] hover:bg-opacity-25 bg-opacity-10 text-[13px] text-black self-start"
                  }`}
              >
                {msg.content}
              </div>
              <div
                className={`text-xs text-gray-500 mt-1 flex items-center space-x-2 ${msg.sender === "user" ? "self-end" : "self-start"
                  }`}
              >
                <div>
                  {msg.sender === "bot" && (
                    <div className="hidden group-hover:flex space-x-3 items-center">
                      {/* Copy Button */}
                      <button
                        className="hover:text-blue-500 text-lg text-gray-400"
                        onClick={() => handleCopyMessage(msg.content, msg.id)}
                      >
                        {copiedMessageId === msg.id ? (
                          <MdCheck className="text-green-500" /> // Show tick icon when copied
                        ) : (
                          <MdOutlineContentCopy />
                        )}
                      </button>
                      {/* Like Button */}
                      <button
                        className={`hover:text-blue-500 text-lg ${msg.reaction === 1 ? "text-blue-500" : "text-gray-400"
                          }`}
                        onClick={() =>
                          handleReactionUpdate(
                            msg.id,
                            msg.reaction === 1 ? null : 1 // Toggle between 1 and null
                          )
                        }
                      >
                        <RiThumbUpFill />
                      </button>
                      {/* Dislike Button */}
                      <button
                        className={`hover:text-red-500 text-lg ${msg.reaction === 0 ? "text-red-500" : "text-gray-400"
                          }`}
                        onClick={() =>
                          handleReactionUpdate(
                            msg.id,
                            msg.reaction === 0 ? null : 0 // Toggle between 0 and null
                          )
                        }
                      >
                        <RiThumbDownFill />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-[11px] flex items-center space-x-2">
                  {msg.sender === "user" ? (
                    "You"
                  ) : (
                    <span className="flex items-center">
                      <ChatbotPopUp width={30} height={30} /> Bot
                    </span>
                  )}{" "}
                  • {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    });
  };


  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="relative">
      <button
        onClick={togglePopup}
        className="fixed bottom-4 right-4 w-16 h-16 z-50 bg-white rounded-full flex justify-center items-center shadow-lg transition-all duration-300 ease-in-out"
      >
        {isVisible ? (
          <MdClose className="text-black text-2xl transition-transform transform duration-300 ease-in-out scale-100" />
        ) : (
          <div className="transition-transform transform duration-300 ease-in-out scale-100">
          <ChatbotPopUp  />
          </div>
        )}
      </button>
      <div
        className={`fixed bottom-20 inset-4 z-40 flex justify-end items-end transition-opacity duration-300 ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        <div
          className={`${isExtended
            ? "w-full h-[calc(100%-4rem)] max-w-screen-xl"
            : "w-[90%] max-w-[396px] h-[624px]"
            } bg-[#E9EFE7] rounded-2xl shadow-md relative bottom-4 right-4 transition-all duration-300`}
        >
          <div className="p-4 flex justify-between items-center">
            <div className="text-lg font-medium">Chat with {agentName}</div>
            <button
              onClick={toggleExtend}
              className="w-8 h-8 rounded-full bg-white flex justify-center items-center shadow-sm"
            >
              <ChatExtendIcon />
            </button>
          </div>
          <div
            ref={chatAreaRef}
            className="w-full flex h-[90%] overflow-y-auto scroll-none bg-white rounded-b-2xl rounded-[32px] flex-col"
            onScroll={handleScroll}
          >
            {!messages.length && (
              <div className="p-4 text-center">
                <p className="text-sm text-black/80">
                  I’m {agentName}'s chatbot. I’m here 24/7 to <br /> answer most
                  questions.
                </p>
                <div className="flex justify-center items-center mt-2">
                  <MessagesBubble />
                </div>
              </div>
            )}
            <div className="p-4 space-y-4 flex flex-col ">
              <div className="pb-[130px]">
                {renderGroupedMessages()}
              </div>
            </div>
          </div>



          <div className="bg-white w-full absolute h-[123px] -bottom-[4px] rounded-b-lg b left-0 p-4">
            <div
              className={`${isExtended ? "w-[98%]" : "w-[90%] max-w-[364px]"
                } absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#F8F8F8] rounded-xl transition-all duration-300`}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-transparent outline-none text-sm p-4 w-full"
                placeholder="Write a message..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <div className="flex justify-between items-center px-4 pb-2">
                <div className="flex space-x-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
                  >
                    <EmojiSelectorIcon />
                  </div>
                  {/* Emoji Picker */}
                  {isEmojiPickerVisible && (
                    <div className="absolute bottom-16 left-0 z-50">
                      <EmojiPicker
                        emojiStyle={EmojiStyle.NATIVE}
                        onEmojiClick={handleEmojiClick} // Handle emoji selection
                      />
                    </div>
                  )}
                  <AttachmentIcon />
                </div>
                <Button type="icon-button" onClick={handleSendMessage}>
                  <span>Send</span>
                  <MessageSendIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPopup;
