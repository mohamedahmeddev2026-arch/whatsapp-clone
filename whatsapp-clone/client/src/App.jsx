import { useState, useEffect, useRef } from "react";
import socket from "./client/socket";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const fileInputRef = useRef();

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  const joinChat = () => {
    if (username.trim() !== "") {
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", {
        sender: username,
        text: message,
        type: "text",
      });
      setMessage("");
    }
  };

  const sendImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      socket.emit("send_message", {
        sender: username,
        file: reader.result,
        type: "image",
      });
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const reader = new FileReader();

      reader.onload = () => {
        socket.emit("send_message", {
          sender: username,
          file: reader.result,
          type: "audio",
        });
      };

      reader.readAsDataURL(blob);
      chunks = [];
    };

    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setMediaRecorder(null);
  };

  if (!joined) {
    return (
      <div className="join-container">
        <h2>ادخل اسمك</h2>
        <input
          type="text"
          placeholder="اسمك..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={joinChat}>دخول</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="header">أهلاً {username}</div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === username ? "my-message" : "other-message"}
          >
            <strong>{msg.sender}</strong>

            {msg.type === "text" && <p>{msg.text}</p>}

            {msg.type === "image" && (
              <img src={msg.file} alt="sent" className="chat-image" />
            )}

            {msg.type === "audio" && <audio controls src={msg.file}></audio>}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="اكتب رسالة..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={sendMessage}>إرسال</button>

        <button onClick={() => fileInputRef.current.click()}>📷</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={sendImage}
        />

        {!mediaRecorder ? (
          <button onClick={startRecording}>🎤</button>
        ) : (
          <button onClick={stopRecording}>⏹</button>
        )}
      </div>
    </div>
  );
}

export default App;
