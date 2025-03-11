const express = require('express');
const {createPost, getPosts} = require('../controllers/postController.js');
const router = express.Router();

const basic = require('../controllers/postController.js');

router.get('/', (req, res) => {
    getPosts(req, res);
});

router.post('/', (req, res) => {
    createPost(req, res);
})

module.exports = router;