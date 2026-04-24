"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

const ChatbotButton = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
    >
      <Bot className="h-6 w-6" />
    </Button>
  );
};

export default ChatbotButton; 