/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import API from "../../../utils/API";
import { ToastContainer, toast } from "react-toastify";

interface Message {
    id: number;
    text: string;
    timestamp: Date;
    sessionId: string;
}

const ReactionLogs: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const chatAreaRef = useRef<HTMLDivElement | null>(null);

    const selectedAgentId = localStorage.getItem("selectedAgentId") || "defaultAgentId";
    const [agentName, setAgentName] = useState("Clearsky Agent"); // Default agent name

    const fetchMessages = async (isLoadMore = false) => {
        if (isFetching || (isLoadMore && page > totalPages)) return;
        setIsFetching(true);

        const currentScrollHeight = chatAreaRef.current?.scrollHeight || 0;

        try {
            const { data } = await API.get(`/chat/reactions/${selectedAgentId}`, {
                params: { page: isLoadMore ? page + 1 : 1, limit: 10 },
            });

            setTotalPages(data.pagination.totalPages);

            interface APIMessage {
                id: number;
                content: string;
                createdAt: string;
                sessionId: string;
            }

            const parsedMessages = data.messages.map((msg: APIMessage) => ({
                id: msg.id,
                text: msg.content,
                timestamp: new Date(msg.createdAt),
                sessionId: msg.sessionId,
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
            toast.error("Failed to fetch messages. Please try again.");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchAgentName(); // Fetch agent name on component mount

    }, []);

    const handleReply = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("replyMessage") as HTMLInputElement;

        if (input.value.trim() === "") return;

        try {
            const response = await API.post("/chat/train", {
                messageId: selectedMessage?.id,
                data: input.value,
                agentId: selectedAgentId,
            });

            if (response.data) {
                // Show success toast
                toast.success("Training successful! The model has been updated.");

                // Clear the input field
                input.value = "";

                // Remove the message from the state
                setMessages((prevMessages) =>
                    prevMessages.filter((message) => message.id !== selectedMessage?.id)
                );

                // Clear the selected message
                setSelectedMessage(null);
            } else {
                // Show error toast
                toast.error("Training failed. Please try again.");
            }
        } catch (error) {
            console.error("Error during training:", error);
            // Show error toast
            toast.error("An error occurred while processing your request. Please try again.");
        }

    };

    const timeAgo = (timestamp: Date) => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    const truncateMessage = (text: string, wordLimit: number): string => {
        const words = text.split(" ");
        return words.length > wordLimit
            ? `${words.slice(0, wordLimit).join(" ")}...`
            : text;
    };

    const handleSelectMessage = (message: Message) => {
        setSelectedMessage((prev) => (prev?.id === message.id ? null : message));
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
        <div className="flex flex-col h-[800px] bg-gray-50 p-6 mx-10 rounded-3xl mt-8">
            <h1 className="text-2xl font-bold">{agentName}</h1>
            <span className="text-xl font-semibold text-gray-800 mb-4">Reaction Logs</span>

            {/* Message List */}
            <div ref={chatAreaRef} className="flex-1 flex flex-col space-y-4 overflow-y-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        onClick={() => handleSelectMessage(message)}
                        className={`flex flex-col space-y-1 p-3 rounded-lg cursor-pointer ${selectedMessage?.id === message.id ? "bg-blue-200" : "bg-gray-200"
                            }`}
                    >
                        <p className="text-gray-900">{message.text}</p>
                        <small className="text-gray-500 text-sm">
                            {timeAgo(message.timestamp)} •{" "}
                            <span className="font-semibold">{message.sessionId}</span>
                        </small>
                    </div>
                ))}
            </div>

            {/* Reply/Train Form */}
            <form
                onSubmit={handleReply}
                className="flex flex-col space-y-2 mt-4 p-3 border rounded-lg bg-white"
            >
                {selectedMessage && (
                    <div className="text-blue-500">
                        Replying to: <strong>{truncateMessage(selectedMessage.text, 10)}</strong>
                    </div>
                )}
                <div className="flex space-x-2">
                    <input
                        type="text"
                        name="replyMessage"
                        placeholder="Write what I will do next time"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                        Train
                    </button>
                </div>
            </form>

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
};

export default ReactionLogs;
