import blackLogo from "./assets/blacklogo.png";
import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  // MUST be set in Render environment variables
  const API_BASE = import.meta.env.VITE_API_URL;
  if (!API_BASE) {
    console.error(
      "VITE_API_URL is not set. Frontend expects the production backend URL."
    );
  }

  const getAllThreads = async () => {
    if (!API_BASE) return;
    try {
      const response = await fetch(`${API_BASE}/api/thread`);
      if (!response.ok) {
        const text = await response.text();
        console.error("getAllThreads API error:", response.status, text);
        return;
      }
      const res = await response.json();
      const filteredData = res.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (err) {
      console.error("getAllThreads failed:", err);
    }
  };

  useEffect(() => {
    getAllThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currThreadId]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    if (!API_BASE) return;
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(`${API_BASE}/api/thread/${newThreadId}`);
      if (!response.ok) {
        const text = await response.text();
        console.error("changeThread API error:", response.status, text);
        return;
      }
      const res = await response.json();
      console.log(res);
      setPrevChats(res);
      setNewChat(false);
      setReply(null);
    } catch (err) {
      console.error("changeThread failed:", err);
    }
  };

  const deleteThread = async (threadId) => {
    if (!API_BASE) return;
    try {
      const response = await fetch(`${API_BASE}/api/thread/${threadId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("deleteThread API error:", response.status, text);
        return;
      }
      const res = await response.json();
      console.log(res);

      // update local list
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.error("deleteThread failed:", err);
    }
  };

  return (
    <section className="sidebar">
      <button onClick={createNewChat}>
        <img src="/blacklogo.png" alt="gpt logo" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId === currThreadId ? "highlighted" : ""}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={(e) => {
                e.stopPropagation(); //stop event bubbling
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>By Shubhra</p>
      </div>
    </section>
  );
}

export default Sidebar;
