const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            maxLength: 100,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

/**
 * Helper method to validate email
 * @param {String} email - The email to be validated
 */
userSchema.statics.validateEmail = function (email) {
    if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
    }
};

/**
 * Helper method to validate password
 * @param {String} password - The password to be validated
 */
userSchema.statics.validatePassword = function (password) {
    // Check if the password is strong enough
    if (!validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
    })) {
        throw new Error('Password must be at least 8 characters long and contain at least one letter and one number');
    }
};

/**
 * Helper method to hash a password.
 * Generates a salt and hashes the given password using bcrypt.
 * @param {String} password - The password to be hashed.
 * @returns {Promise<String>} - A promise that resolves to the hashed password.
 */
userSchema.statics.hashPassword = async function (password) {
    // Generate a salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    return bcrypt.hash(password, salt);
};

/**
 * Helper method to generate a JWT token for a user.
 * @param {Object} user - The user to generate the token for.
 * @returns {String} - The generated token.
 */
userSchema.statics.generateToken = function (user) {
    return jwt.sign(
        // Payload that contains the user's ID and email
        { userId: user._id, email: user.email },
        // Secret to sign the token with
        process.env.JWT_SECRET,
        // Options for the token
        {
            // The token will expire in 1 day
            expiresIn: '1d',
        }
    );
};

/**
 * Helper method to find a user by their email.
 * @param {String} email - The email of the user to be found.
 * @returns {Promise<Object>} - A promise that resolves to the found user object.
 * @throws {Error} - Throws an error if the user is not found.
 */
userSchema.statics.findUserByEmail = async function (email) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

/**
 * Registers a new user with the provided name, email, and password.
 * @param {String} name - The name of the user to be registered.
 * @param {String} email - The email of the user to be registered.
 * @param {String} password - The password of the user to be registered.
 * @returns {Promise<Object>} - A promise that resolves to the newly created user object.
 * @throws {Error} - Throws an error if the user is not found or if the password is not strong enough.
 */
userSchema.statics.register = async function (name, email, password) {
    try {
        // Validate the email
        this.validateEmail(email);
        // Validate the password
        this.validatePassword(password);

        // Hash the password
        const hashedPassword = await this.hashPassword(password);

        // Create the new user
        const user = new this({
            name,
            email,
            password: hashedPassword,
        });

        // Save the new user
        return user.save();
    } catch (error) {
        // Throw an error if something goes wrong
        throw new Error('Error registering user: ' + error.message);
    }
};

/**
 * Retrieves a user by their ID.
 * @param {String} userId - The ID of the user to be retrieved.
 * @returns {Promise<Object>} - A promise that resolves to the user object.
 * @throws {Error} - Throws an error if the user is not found or if there is an issue during the retrieval process.
 */
userSchema.statics.getUser = async function (userId) {
    try {
        // Find the user by their ID
        const user = await this.findById(userId);
        // If the user is not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }
        // Return the retrieved user
        return user;
    } catch (error) {
        // Throw an error if there's an issue during retrieval
        throw new Error(`Error fetching user: ${error.message}`);
    }
};

/**
 * Logs in a user and generates a JWT token.
 * @param {String} email - The email address of the user to be logged in.
 * @param {String} password - The password of the user to be logged in.
 * @returns {Promise<Object>} - A promise that resolves to an object containing a message and a JWT token.
 * @throws {Error} - Throws an error if the email or password is invalid or if there is an issue during the login process.
 */
userSchema.statics.login = async function (email, password) {
    try {
        // Find the user by their email
        const user = await this.findUserByEmail(email);

        // Compare the given password with the stored password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        // Generate a JWT token for the user
        const token = this.generateToken(user);

        // Return the JWT token
        return { message: 'Successfully logged in!', token };
    } catch (error) {
        // Throw an error if there's an issue during the login process
        throw new Error(`Error logging in: ${error.message}`);
    }
};

/**
 * Deletes a user from the database.
 * @param {String} userId - The ID of the user to be deleted.
 * @returns {Promise<Object>} - A promise that resolves to an object containing a message.
 * @throws {Error} - Throws an error if the user is not found or if there is an issue during the deletion process.
 */
userSchema.statics.deleteUser = async function (userId) {
    try {
        // Find the user to be deleted
        const user = await this.findByIdAndDelete(userId);
        if (!user) {
            // Throw an error if the user was not found
            throw new Error('User not found');
        }
        // Return a success message
        return { message: 'User deleted successfully' };
    } catch (error) {
        // Throw an error if there's an issue during the deletion process
        throw new Error(`Error deleting user: ${error.message}`);
    }
};

/**
 * Updates user details. If a new password is provided, it will be hashed before updating.
 * @param {String} userId - The ID of the user to be updated.
 * @param {Object} updatedFields - An object containing the fields to be updated.
 * @returns {Promise<Object>} - A promise that resolves to the updated user object.
 * @throws {Error} - Throws an error if the user is not found or if there is an issue during the update process.
 */
userSchema.statics.updateUser = async function (userId, updatedFields) {
    try {
        // Check if the password needs to be updated and hash it
        if (updatedFields.password) {
            updatedFields.password = await this.hashPassword(updatedFields.password);
        }

        // Update the user with the provided fields and return the updated user object
        const user = await this.findByIdAndUpdate(
            userId,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        // If the user is not found, throw an error
        if (!user) {
            throw new Error('User not found');
        }

        // Return the updated user object
        return user;
    } catch (error) {
        // Throw an error if there's an issue during the update process
        throw new Error(`Error updating user: ${error.message}`);
    }
};

const userModel = mongoose.model('Users', userSchema);

module.exports = userModel;