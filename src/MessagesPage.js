import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // Import AuthContext

const ws = new WebSocket("ws://localhost:4000/cable");

function MessagesPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [guid, setGuid] = useState("");
  const [messagesContainer, setMessagesContainer] = useState(null);
  const { auth } = useContext(AuthContext); // Access auth context
  const user_id = auth.user?.user_id; // Retrieve user_id from context

  useEffect(() => {
    setMessagesContainer(document.getElementById("messages"));
  }, []);

  const resetScroll = useCallback(() => {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messagesContainer]);

  const fetchMessages = useCallback(async () => {
    try {
      const url = `https://frontend-aid-25b7d93d6106.herokuapp.com/messages/${conversationId}`;
      console.log("Fetching messages from:", url); // Log the URL being fetched

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Received messages data:", data); // Log the received data

      // Reverse the order of messages to display latest at the bottom
      setMessages(data.reverse());

      resetScroll();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [conversationId, resetScroll]);

  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to websocket server");
      const newGuid = Math.random().toString(36).substring(2, 15);
      setGuid(newGuid);

      ws.send(
        JSON.stringify({
          command: "subscribe",
          identifier: JSON.stringify({
            id: newGuid,
            conversation_id: conversationId,
            channel: "MessagesChannel",
          }),
        })
      );
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("WebSocket message received:", data);
      if (["ping", "welcome", "confirm_subscription"].includes(data.type)) return;

      // Append new message to messages state
      setMessages(prevMessages => [...prevMessages, data.message]);

      resetScroll();
    };

    return () => {
      ws.close();
    };
  }, [conversationId, resetScroll]);

  useEffect(() => {
    fetchMessages();

    // Set up interval to fetch messages every 3 seconds
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 3000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [conversationId, fetchMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value = "";

    // Ensure user_id is properly retrieved from context
    if (!user_id) return; // Handle the case where user_id is not available

    // Adjust the URL and message structure based on your backend requirements
    try {
      const response = await fetch("https://frontend-aid-25b7d93d6106.herokuapp.com/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body,
          conversation_id: conversationId,
          sender_id: user_id,
          user_id: user_id, // Include user_id in the POST request
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      // Refresh messages after sending new message
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="messagesPage">
      <h1>Conversation ID: {conversationId}</h1>

      <div className="messages" id="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-content p-3 ${message.sender_id === user_id
                ? 'bg-primary text-white rounded-right'
                : 'bg-secondary text-black rounded-left'
              }`}
          >
            <p className="mb-0">{message.body}</p>
          </div>
        ))}
      </div>
      <div className="messageForm">
        <form onSubmit={handleSubmit}>
          <input className="messageInput" type="text" name="message" />
          <button className="messageButton" type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default MessagesPage;
