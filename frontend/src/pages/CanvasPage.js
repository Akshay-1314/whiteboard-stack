import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import Toolbar from "../components/Toolbar";
import BoardProvider from "../store/BoardProvider";
import ToolboxProvider from "../store/ToolboxProvider";
import Toolbox from "../components/Toolbox";
import Loading from "../utils/Loading";
import io from 'socket.io-client';

const CanvasPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [elements, setElements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ss, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // const fetchCanvas = async () => {
    //   try {
    //     const response = await axios.get(`http://localhost:8000/canvas/${id}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setCanvas(response.data);
    //   } catch (err) {
    //     setError("Error loading canvas. Please try again.");
    //     console.error("Error fetching canvas:", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    const socket = io(process.env.REACT_APP_API_URL, {
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (id) {
      socket.emit("joinCanvas", { canvasId: id });

      socket.on("loadCanvas", (canvasData) => {
        setSocket(socket);
        setElements(canvasData.elements);
        setLoading(false);
      });

      socket.on("unauthorized", (data) => {
        setError(`Error loading canvas: ${data.message}`);
      });

      return () => {
        socket.off("loadCanvas");
        socket.off("unauthorized");
      };
    }

  }, [id, navigate]);

  if (loading) {
    return <Loading children={"Loading Canvas..."}/>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* <h2 className="text-2xl font-bold mb-4">{canvas?.name}</h2> */}
      <BoardProvider>
        <ToolboxProvider>
          <Board initialElements={elements} canvasId={id} socket={ss}/>
          <Toolbar />
          <Toolbox />
        </ToolboxProvider>
      </BoardProvider>
    </>
  );
};

export default CanvasPage;
