import React, { useState, useRef, useEffect } from "react";
import { Mic, X, Send } from "lucide-react";

export default function VoiceAssistantUI({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I assist you on the farm today?" }
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        setMessages((msgs) => [
          ...msgs,
          { sender: "user", text: transcript }
        ]);
        fetchBotResponse(transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // FIXED: Updated fetch URL to use correct port 5000
  const fetchBotResponse = async (userInput) => {
    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error("Backend error:", data.error);
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "Sorry, I couldn't process your request." }
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: data.response }
        ]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, there was an error connecting to the server. Please make sure the backend is running on port 5000." }
      ]);
    }
  };

  const sendMessage = () => {
    if (input.trim() === "") return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input }
    ]);
    fetchBotResponse(input);
    setInput("");
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      console.warn("Speech recognition not available.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle overlay click to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-black/95 backdrop-blur-xl w-full max-w-lg mx-4 h-[600px] rounded-2xl shadow-2xl border border-blue-900/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-900/70 to-purple-900/70 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-white via-blue-100 to-blue-600 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-white font-semibold text-lg">AgriSense Assistant</h3>
              <p className="text-blue-200 text-sm">How can I help you today?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500/50 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Central Orb */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 via-blue-500 to-blue-700 opacity-30 blur-xl"></div>
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white via-blue-100 to-blue-600 shadow-2xl">
              <div className="absolute top-4 left-6 w-12 h-12 rounded-full bg-gradient-to-br from-white to-transparent opacity-40 blur-sm"></div>
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-transparent via-blue-200 to-blue-400 opacity-60"></div>
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white via-transparent to-blue-300 opacity-30"></div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-700 text-white rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900/50 border-t border-white/10">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800/60 text-white rounded-2xl outline-none border border-gray-600/50 focus:border-blue-500/50 placeholder-gray-400"
                placeholder="Ask about your farm..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                autoFocus
              />
              <button
                onClick={sendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <button
              onClick={toggleRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Mic className={`w-6 h-6 text-white ${isRecording ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
