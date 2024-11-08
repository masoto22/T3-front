// https://medium.com/@timnirmal/stream-openai-respond-through-fastapi-to-next-js-14-better-version-8ef84b714c7a
'use client';

import React, {useState, useEffect, useRef} from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Trash2 } from 'lucide-react';

interface Movie {
  title: string;
  imagePath: string;
}


export const chatModel = async (messages: { role: string; content: string }[], onMessage: (partialMessage: string) => void) => {
  const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          model: "integra-LLM",
          messages: messages,
      }),
  });

  if (!response.ok) {
      throw new Error('Network response was not ok');
  }

  if (!response.body) {
      throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedMessage = '';

  while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const decodedValue = decoder.decode(value);
      const messages = decodedValue.split("\n\n");
      for (const message of messages) {
          if (message.trim()) {
              try {
                  const jsonString = message.startsWith('data: ') ? message.slice(6) : message;
                  const data = JSON.parse(jsonString);
                accumulatedMessage += data.message.content;
                onMessage(accumulatedMessage);
            } catch (parseError) {
                console.error('Error parsing message:', message, parseError);
            }
        }
    }
  }
};

const Chat = ({ selectedMovie }: { selectedMovie: Movie | null }) => {
    const [messages, setMessages] = useState<{ id?: string; role: string; content: string }[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
    }, []);
  
    const handleSend = async () => {
      if (input.trim() && selectedMovie) {
        const userMessage = `Consulta sobre la película: ${selectedMovie.title}. ${input}`;
        const newMessageId = crypto.randomUUID();

            // Add the user's message to the local state
            setMessages(prevMessages => [...prevMessages, {id: newMessageId, role: 'user', content: userMessage}]);
            setInput('');

            try {
                // Placeholder for the assistant message
                const assistantMessageId = crypto.randomUUID();
                let assistantMessageContent = '';

                setMessages(prevMessages => [
                    ...prevMessages,
                    {id: assistantMessageId, role: 'assistant', content: assistantMessageContent}
                ]);

                await chatModel([{ role: 'user', content: userMessage }], (partialMessage) => {
                    assistantMessageContent = partialMessage;
                    setMessages(prevMessages => {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[updatedMessages.length - 1].content = assistantMessageContent;
                        return updatedMessages;
                    });
                });

                // Save the updated messages to localStorage
                setTimeout(() => {
                    const updatedMessages = [
                        ...messages,
                        {id: newMessageId, role: 'user', content: userMessage},
                        {id: assistantMessageId, role: 'assistant', content: assistantMessageContent}
                    ];
                    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
                }, 500);
            } catch (error) {
                console.error('Error getting chat response:', error);
            }
        }
    };

    
      const handleClearChat = () => {
        setMessages([]);
        localStorage.removeItem('chatMessages');
      };
    
      useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, [messages]);
    
      return (
        <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-white shadow-xl flex flex-col h-screen">
          <div className="bg-pink-500 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Haz una pregunta sobre la película seleccionada</h2>
            <button
              onClick={handleClearChat}
              className="hover:text-white text-gray-200 transition-colors duration-200"
              aria-label="Clear chat"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-4 bg-gray-700 space-y-4">
            {messages.map((message, index) => (
              <div
              key={index}
              className={`p-3 rounded-lg ${
                message.role === 'user' ? 'bg-purple-500 text-white ml-auto' : 'bg-pink-500 text-white mr-auto'
              } max-w-[80%]`}
            >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="flex-grow p-2 rounded-lg text-white bg-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ingresa tu consulta..."
              />
              <button
                onClick={handleSend}
                className="p-2 text-white rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Enviar mensaje"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    export default Chat;