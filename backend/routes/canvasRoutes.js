const router = require('express').Router();
const authenticationMiddleware = require('../middlewares/authenticationMiddleware.js');
const { getAllCanvases, createCanvas, loadCanvas, updateCanvas, deleteCanvas, updateCanvasProfile, shareCanvas } = require('../controllers/canvasController.js');

router.get('/', authenticationMiddleware, getAllCanvases);
router.post('/', authenticationMiddleware, createCanvas);
router.get('/:id', authenticationMiddleware, loadCanvas);
router.put('/:id', authenticationMiddleware, updateCanvas);
router.put('/updateCanvasProfile/:id', authenticationMiddleware, updateCanvasProfile);
router.put('/share/:id', authenticationMiddleware, shareCanvas);
router.delete('/:id', authenticationMiddleware, deleteCanvas);

module.exports = router;