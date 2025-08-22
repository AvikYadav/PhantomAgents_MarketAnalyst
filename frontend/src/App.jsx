import React, { useState, useEffect, useRef } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- INLINE ICONS ---
// Using emojis as inline icons for simplicity and reliability.
const UserIcon = () => <div style={{ fontSize: "20px" }}>🧑</div>;
const BotIcon = () => <div style={{ fontSize: "20px" }}>🤖</div>;
const SendIcon = () => <div style={{ fontSize: "18px" }}>➤</div>;

// --- LOADER ---
const Loader = () => (
  <>
    <div style={{ display: "flex", gap: "4px" }}>
      <span style={{ width: 6, height: 6, background: "#8b5cf6", borderRadius: "50%", animation: "bounce 1s infinite" }}></span>
      <span style={{ width: 6, height: 6, background: "#8b5cf6", borderRadius: "50%", animation: "bounce 1s infinite 0.2s" }}></span>
      <span style={{ width: 6, height: 6, background: "#8b5cf6", borderRadius: "50%", animation: "bounce 1s infinite 0.4s" }}></span>
    </div>
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1.0); }
      }
    `}</style>
  </>
);

// --- MOCK VECTOR DATA ---
const mockVectorData = [
  { x: -21.435, y: 3.223, type: 'Financials' },
  { x: -20.074, y: 4.124, type: 'Financials' },
  { x: -21.254, y: 5.048, type: 'Financials' },
  { x: -16.512, y: 1.890, type: 'Sentiment' },
  { x: -17.966, y: 3.738, type: 'Sentiment' },
  { x: -19.506, y: 6.867, type: 'Sentiment' },
  { x: -4.581, y: -3.741, type: 'Innovation' },
  { x: -6.664, y: -11.835, type: 'Innovation' },
  { x: -8.231, y: -9.567, type: 'Innovation' },
];

// --- SYMBOL MAP (UPDATED FOR DARK THEME) ---
const typeMapping = {
  Financials: { color: '#c084fc', shape: 'triangle' }, // A vibrant purple
  Sentiment: { color: '#4ade80', shape: 'circle' },    // A vibrant green
  Innovation: { color: '#22d3ee', shape: 'star' },     // A vibrant cyan
};

// --- CUSTOM SHAPE RENDERER ---
const CustomShape = (props) => {
  const { cx, cy, payload } = props;
  const { type } = payload;
  const { color, shape } = typeMapping[type];

  if (shape === 'circle') {
    return <circle cx={cx} cy={cy} r={6} fill={color} />;
  } else if (shape === 'triangle') {
    return (
      <path
        d={`M${cx} ${cy - 6} L${cx - 6} ${cy + 6} L${cx + 6} ${cy + 6} Z`}
        fill={color}
      />
    );
  } else if (shape === 'star') {
    return (
      <path
        d={`M${cx} ${cy - 6} L${cx + 2} ${cy - 2} L${cx + 6} ${cy - 2} 
           L${cx + 3} ${cy + 1} L${cx + 4} ${cy + 6} 
           L${cx} ${cy + 3} L${cx - 4} ${cy + 6} 
           L${cx - 3} ${cy + 1} L${cx - 6} ${cy - 2} 
           L${cx - 2} ${cy - 2} Z`}
        fill={color}
      />
    );
  }
  return null;
};

// --- MAIN APP ---
export default function App() {
  const [messages, setMessages] = useState([{ text: "Hello! I'm your AI Market Analyst. How can I help?", sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, msg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { text: "Here’s some analysis based on your query!", sender: 'bot' }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#1c1c1c", color: "#e0e0e0", fontFamily: "Poppins, sans-serif" }}>
      
      {/* Chat Section */}
      <div style={{ flex: "2", background: "#2a2a2a", borderRight: "1px solid #444", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.5rem", background: "linear-gradient(180deg, #8b5cf6, #5b21b6)", color: "white", fontWeight: "bold", fontSize: "1.75rem", textAlign: "center" }}> AI Market Research Analyst</div>
        
        <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", marginBottom: "1rem", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
              {msg.sender === "bot" && <BotIcon />}
              <div style={{ 
                maxWidth: "70%", 
                padding: "0.6rem 1rem", 
                borderRadius: "12px", 
                marginLeft: msg.sender === "bot" ? "0.5rem" : "0", 
                marginRight: msg.sender === "user" ? "0.5rem" : "0",
                background: msg.sender === "user" ? "#8b5cf6" : "#333333", 
                color: msg.sender === "user" ? "white" : "#e0e0e0",
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                {msg.text}
              </div>
              {msg.sender === "user" && <UserIcon />}
            </div>
          ))}
          {isLoading && <Loader />}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} style={{ display: "flex", padding: "0.5rem", borderTop: "1px solid #444", background: "#2a2a2a" }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your query..." 
            style={{ 
              flex: 1, 
              padding: "0.5rem", 
              border: "1px solid #444", 
              borderRadius: "8px", 
              background: "#1c1c1c", 
              color: "#e0e0e0" 
            }} 
          />
          <button type="submit" style={{ marginLeft: "0.5rem", background: "#8b5cf6", color: "white", border: "none", borderRadius: "50%", padding: "0.5rem", cursor: "pointer" }}><SendIcon /></button>
        </form>
      </div>

      {/* Scatter Plot Section */}
      <div style={{ flex: 1, padding: "2rem", background: "#2a2a2a", borderRadius: "8px", margin: "1rem" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "1rem" }}>Company Feature Space</h2>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart>
            <CartesianGrid stroke="#444" />
            <XAxis type="number" dataKey="x" name="X" stroke="#e0e0e0" />
            <YAxis type="number" dataKey="y" name="Y" stroke="#e0e0e0" />
            <Tooltip content={({ payload }) => payload && payload.length ? (
              <div style={{ background: "#333333", padding: "6px 10px", border: "1px solid #444", borderRadius: "6px" }}>
                <p><b>Type:</b> {payload[0].payload.type}</p>
                <p>X: {payload[0].payload.x.toFixed(3)}, Y: {payload[0].payload.y.toFixed(3)}</p>
              </div>
            ) : null} />
            <Scatter data={mockVectorData} shape={<CustomShape />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
