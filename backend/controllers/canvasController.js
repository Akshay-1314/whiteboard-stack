const jwt = require('jsonwebtoken');
const Canvas = require('../models/canvasModel.js');
const Users = require('../models/userModel.js');
const canvasData = {};

const getAllCanvases = async (req, res) => {
    const email = req.user.email;
    try {
        const canvases = await Canvas.getAllCanvases(email);
        res.status(200).json(canvases);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const createCanvas = async (req, res) => {
    const email = req.user.email;
    const { name } = req.body;
    try {
        const newCanvas = await Canvas.createCanvas(email, name);
        res.status(201).json(newCanvas);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const loadCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const email = req.user.email;

        const canvas = await Canvas.loadCanvas(email, canvasId);
        if (!canvas) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        res.status(200).json(canvas);
    } catch (error) {
        res.status(500).json({ error: "Failed to load canvas", details: error.message });
    }
}

const updateCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const email = req.user.email;
        const { elements } = req.body;

        const canvas = await Canvas.updateCanvas(email, canvasId, elements);
        if (!canvas) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        res.status(200).json(canvas);
    } catch (error) {
        res.status(400).json({ error: "Failed to update canvas", details: error.message });
    }
}

const updateCanvasProfile = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const email = req.user.email;
        const { name } = req.body;

        const canvas = await Canvas.updateCanvasProfile(email, name, canvasId);
        if (!canvas) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        res.status(200).json(canvas);
    } catch (error) {
        res.status(400).json({ error: "Failed to update canvas profile", details: error.message });
    }
}

const deleteCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const email = req.user.email;
        const result = await Canvas.deleteCanvas(email, canvasId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const shareCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const email = req.user.email;
        const { sharedEmail } = req.body;

        if (!sharedEmail) {
            return res.status(400).json({ error: 'Shared email is required' });
        }

        const result = await Canvas.shareCanvas(email, canvasId, sharedEmail);
        return res.status(200).json(result);
    } catch (error) {
        // Determine status code based on error message
        let statusCode = 500;

        if (error.message.includes('not found')) {
            statusCode = 404;
        } else if (error.message.includes('permission')) {
            statusCode = 403;
        } else if (error.message.includes('already shared')) {
            statusCode = 400;
        }

        return res.status(statusCode).json({ error: error.message });
    }
};

const handleJoinCanvas = async (socket, { canvasId }) => {
    console.log("Joining canvas: ", canvasId);
    try {
        const authHeader = socket.handshake.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            socket.emit("unauthorized", { message: "Unauthorized" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findOne({email: decoded.email});
        if (!user) {
            socket.emit("unauthorized", { message: "Unauthorized" });
            return;
        }
        const canvas = await Canvas.loadCanvas(user.email, canvasId);
        if (!canvas) {
            socket.emit("unauthorized", { message: "Unauthorized" });
            return;
        }
        socket.join(canvasId);
        console.log(`User ${user.email} joined canvas ${canvasId}`);
        socket.emit("loadCanvas", canvas);
    } catch (error) {
        console.error(error);
        socket.emit("unauthorized", { message: "Unauthorized" });
    }
}

const handleUpdateCanvas = async (io, socket, { canvasId, elements }) => {
    console.log("Updating canvas: ", canvasId);
    try {
        canvasData[canvasId] = elements;
        const canvas = await Canvas.findById(canvasId);
        if (canvas)
            await Canvas.findByIdAndUpdate(canvasId, { elements }, {new: true, useFindAndModify: false});
        socket.to(canvasId).emit("receiveDrawingUpdate", elements);
    } catch (error) {
        console.error(`Error in drawing update:`, error);
    }
}

module.exports = {
    getAllCanvases,
    createCanvas,
    loadCanvas,
    updateCanvas,
    updateCanvasProfile,
    deleteCanvas,
    shareCanvas,
    handleJoinCanvas,
    handleUpdateCanvas,
}