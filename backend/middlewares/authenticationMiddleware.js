const jwt = require('jsonwebtoken');

const authenticationMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).error({ message: 'Invalid or expired token' });
    }
}

module.exports = authenticationMiddleware;