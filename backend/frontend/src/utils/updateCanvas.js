// utils/api.js
import axios from "axios";

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/canvas/`;

const updateCanvas = async (canvasId, elements) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Unauthorized canvas update');
        }
        const response = await axios.put(
            `${API_BASE_URL}/${canvasId}`,
            { elements },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Canvas updated successfully in the database!", response.data);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to update canvas: ${error.message}`);
    }
};

export default updateCanvas;