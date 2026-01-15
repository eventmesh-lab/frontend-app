import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/adapters/signalr/SignalRStreamingAdapter';

export interface StreamingChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
}

export const StreamingChat: React.FC<StreamingChatProps> = ({
    messages,
    onSendMessage,
}) => {
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (inputMessage.trim()) {
            onSendMessage(inputMessage);
            setInputMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
            {/* Chat Header */}
            <div className="bg-gray-100 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">Chat en vivo</h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-center text-sm">
                        No hay mensajes aún. ¡Sé el primero en comentar!
                    </p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="chat-message">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {msg.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-semibold text-sm text-gray-800">
                                            {msg.username}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputMessage.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};
