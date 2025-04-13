import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTrash, FaPlus, FaShare, FaExclamationTriangle } from "react-icons/fa";

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [canvases, setCanvases] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newCanvasName, setNewCanvasName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalError, setModalError] = useState("");
    const [editingCanvasId, setEditingCanvasId] = useState(null);
    const [updatedCanvasName, setUpdatedCanvasName] = useState("");
    const [updateError, setUpdateError] = useState("");
    // New state for canvas sharing
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharingCanvasId, setSharingCanvasId] = useState(null);
    const [shareEmail, setShareEmail] = useState("");
    const [shareError, setShareError] = useState("");
    const [shareSuccess, setShareSuccess] = useState("");
    // New state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCanvasId, setDeletingCanvasId] = useState(null);
    const [deletingCanvasName, setDeletingCanvasName] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [operationSuccess, setOperationSuccess] = useState({ message: "", type: "" });
    const API_URL = process.env.REACT_APP_API_URL;


    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/register");
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`${API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Session expired. Please log in again.");
                localStorage.removeItem("token");
                navigate("/register");
            }
        };

        const fetchUserCanvases = async () => {
            try {
                const response = await axios.get(`${API_URL}/canvas/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCanvases(response.data);
            } catch (err) {
                console.error("Error fetching canvases:", err);
            }
        };

        const fetchData = async () => {
            await fetchUserProfile();
            await fetchUserCanvases();
            setLoading(false);
        };

        fetchData();
    }, [navigate, API_URL]);

    // Helper function to show temporary success message
    const showSuccessMessage = (message, type) => {
        setOperationSuccess({ message, type });
        setTimeout(() => {
            setOperationSuccess({ message: "", type: "" });
        }, 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleDeleteUser = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_URL}/users/delete`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            localStorage.removeItem("token");
            navigate("/register");
        } catch (error) {
            console.error("Error deleting account:", error);
        }
    };

    const handleCreateCanvas = async () => {
        if (!newCanvasName.trim()) {
            setModalError("Canvas name cannot be empty.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${API_URL}/canvas/`,
                { name: newCanvasName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCanvases([...canvases, response.data]); // Update UI with new canvas
            setNewCanvasName("");
            setModalError(""); // Clear errors
            setShowModal(false); // Close modal
            showSuccessMessage("Canvas created successfully!", "create");
        } catch (error) {
            console.error("Error creating canvas:", error);
            setModalError("Failed to create canvas. Please try again.");
        }
    };

    // Updated to use the deletion confirmation modal
    const openDeleteModal = (canvas) => {
        setDeletingCanvasId(canvas._id);
        setDeletingCanvasName(canvas.name);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleDeleteCanvas = async () => {
        try {
            const token = localStorage.getItem("token");

            await axios.delete(`${API_URL}/canvas/${deletingCanvasId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove the deleted canvas from the UI
            setCanvases(canvases.filter(canvas => canvas._id !== deletingCanvasId));
            setShowDeleteModal(false);
            showSuccessMessage("Canvas deleted successfully.", "delete");
        } catch (error) {
            console.error("Error deleting canvas:", error);
            setDeleteError("Failed to delete canvas. Please try again.");
        }
    };

    const handleUpdateCanvas = async (canvasId) => {
        if (!updatedCanvasName.trim()) {
            setUpdateError("Canvas name cannot be empty.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await axios.put(
                `${API_URL}/canvas/updateCanvasProfile/${canvasId}`,
                { name: updatedCanvasName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update the local state with the new name
            setCanvases(canvases.map(canvas =>
                canvas._id === canvasId ? { ...canvas, name: response.data.name } : canvas
            ));

            setEditingCanvasId(null); // Exit edit mode
            setUpdatedCanvasName("");
            setUpdateError("");
            showSuccessMessage("Canvas name updated successfully.", "update");
        } catch (error) {
            console.error("Error updating canvas:", error);
            setUpdateError("Failed to update canvas name. Try again.");
        }
    };

    // Function to handle canvas sharing
    const handleShareCanvas = async () => {
        // Validate email format
        if (!shareEmail.trim() || !/^\S+@\S+\.\S+$/.test(shareEmail)) {
            setShareError("Please enter a valid email address.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${API_URL}/canvas/share/${sharingCanvasId}`,
                { sharedEmail: shareEmail },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Show success message
            setShareSuccess(`Canvas shared successfully with ${shareEmail}!`);
            setShareEmail("");
            setShareError("");
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setShareSuccess("");
                setShowShareModal(false);
                setSharingCanvasId(null);
            }, 3000);
        } catch (error) {
            console.error("Error sharing canvas:", error);
            setShareError("Failed to share canvas. Please try again.");
        }
    };

    // Function to open the share modal
    const openShareModal = (canvasId) => {
        setSharingCanvasId(canvasId);
        setShareEmail("");
        setShareError("");
        setShareSuccess("");
        setShowShareModal(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
                <p className="text-white text-lg animate-pulse">Loading profile & canvases...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            {/* Toast notification for success messages */}
            {operationSuccess.message && (
                <div className="fixed top-4 right-4 z-50 max-w-md">
                    <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p>{operationSuccess.message}</p>
                    </div>
                </div>
            )}

            {/* Sidebar Profile Section */}
            <div className="w-1/4 bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-white flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                {error ? (
                    <p className="text-red-400">{error}</p>
                ) : user ? (
                    <div className="text-center">
                        <p className="mb-1 text-lg font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-200">{user.email}</p>
                    </div>
                ) : (
                    <p className="text-white">No user data available.</p>
                )}

                <div className="mt-6 flex flex-col w-full space-y-3">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all duration-300 w-full"
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                    <button
                        onClick={handleDeleteUser}
                        className="flex items-center justify-center gap-2 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800 transition-all duration-300 w-full"
                    >
                        <FaTrash /> Delete Account
                    </button>
                </div>
            </div>

            {/* Main Content - Canvases */}
            <div className="w-3/4 pl-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Your Canvases</h3>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
                    >
                        <FaPlus /> Create Canvas
                    </button>
                </div>

                {canvases.length > 0 ? (
                    <div className="grid grid-cols-2 gap-5">
                        {canvases.map((canvas) => (
                            <div
                                key={canvas._id}
                                className="flex items-center justify-between bg-white bg-opacity-20 backdrop-blur-lg p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                            >
                                <div>
                                    {editingCanvasId === canvas._id ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={updatedCanvasName}
                                                onChange={(e) => setUpdatedCanvasName(e.target.value)}
                                                className="p-1 rounded text-black w-full"
                                                placeholder="Enter new name"
                                            />
                                            {updateError && <p className="text-red-300 text-sm mt-1">{updateError}</p>}
                                        </div>
                                    ) : (
                                        <h4 className="text-lg font-semibold text-white">{canvas.name}</h4>
                                    )}
                                    <p className="text-sm text-gray-200">Created: {new Date(canvas.createdAt).toLocaleString()}</p>
                                    <p className="text-sm text-gray-200">Last Updated: {new Date(canvas.updatedAt).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    {editingCanvasId === canvas._id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateCanvas(canvas._id)}
                                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCanvasId(null);
                                                    setUpdatedCanvasName("");
                                                    setUpdateError("");
                                                }}
                                                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-300"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingCanvasId(canvas._id);
                                                    setUpdatedCanvasName(canvas.name);
                                                    setUpdateError("");
                                                }}
                                                className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                                            >
                                                Edit
                                            </button>
                                            <button
                                              onClick={() => {
                                                navigate(`/canvas/${canvas._id}`);
                                              }}
                                              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all duration-300"
                                            >
                                              Open
                                            </button>
                                            <button
                                                onClick={() => openShareModal(canvas._id)}
                                                className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-all duration-300 flex items-center gap-1"
                                            >
                                                <FaShare /> Share
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(canvas)}
                                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-1"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-white">No canvases found.</p>
                )}
            </div>

            {/* Create Canvas Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Create New Canvas</h3>
                        <input
                            type="text"
                            placeholder="Enter canvas name..."
                            value={newCanvasName}
                            onChange={(e) => setNewCanvasName(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none"
                        />
                        {modalError && <p className="text-red-500 mt-2">{modalError}</p>}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setModalError(""); // Clear errors when closing
                                    setNewCanvasName("");
                                }}
                                className="mr-2 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCanvas}
                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Canvas Modal */}
            {showShareModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">Share Canvas</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter the email address of the person you want to share this canvas with.
                        </p>
                        <input
                            type="email"
                            placeholder="Enter email address..."
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none"
                        />
                        {shareError && <p className="text-red-500 mt-2">{shareError}</p>}
                        {shareSuccess && <p className="text-green-500 mt-2">{shareSuccess}</p>}
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setSharingCanvasId(null);
                                    setShareEmail("");
                                    setShareError("");
                                    setShareSuccess("");
                                }}
                                className="mr-2 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                                disabled={!!shareSuccess}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleShareCanvas}
                                className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
                                disabled={!!shareSuccess}
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Canvas Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <div className="flex items-center text-red-500 mb-4">
                            <FaExclamationTriangle className="text-2xl mr-2" />
                            <h3 className="text-lg font-bold">Confirm Deletion</h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete the canvas <span className="font-semibold">"{deletingCanvasName}"</span>? This action cannot be undone.
                        </p>
                        {deleteError && <p className="text-red-500 mb-4 p-2 bg-red-100 rounded">{deleteError}</p>}
                        <div className="flex justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletingCanvasId(null);
                                    setDeletingCanvasName("");
                                    setDeleteError("");
                                }}
                                className="mr-2 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCanvas}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 flex items-center"
                            >
                                <FaTrash className="mr-1" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;