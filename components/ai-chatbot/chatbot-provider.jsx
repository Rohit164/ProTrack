"use client";

import React, { createContext, useContext, useState } from "react";
import Chatbot from "./chatbot";
import ChatbotButton from "./chatbot-button";

const ChatbotContext = createContext({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
});

export const useChatbot = () => useContext(ChatbotContext);

const ChatbotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  return (
    <ChatbotContext.Provider value={{ isOpen, openChat, closeChat }}>
      {children}
      <ChatbotButton onClick={openChat} />
      <Chatbot isOpen={isOpen} onClose={closeChat} />
    </ChatbotContext.Provider>
  );
};

export default ChatbotProvider; 