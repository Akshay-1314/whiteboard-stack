const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    numberOfLikes: {
        type: Number,
        default: 0
    }},
    {
        timestamps: true,
        collection: 'test'
    }
);

postSchema.statics.createPost = async function (title, content) {
    try {
        const post = new this({
            title,
            content
        });
        return post.save();
    } catch (error) {
        throw new Error('Error creating post: ' + error.message);
    }
}

postSchema.statics.getPosts = async function () {
    try {
        return this.find();
    } catch {
        throw new Error('Error getting posts: ' + error.message);
    }
}

const postModel = mongoose.model('Posts', postSchema);

module.exports = postModel;