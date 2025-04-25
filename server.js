const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const UserModel = require('./User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect('mongodb+srv://admin:admin@cluster0tesr.ba9zrzu.mongodb.net/DemoApp')
    .then(() => console.log('✅ Database Connected'))
    .catch(err => console.error('❌ Database Connection Error:', err));

// Room Schema and Model
const RoomSchema = new mongoose.Schema({
    guestName: String,
    hotel: String,
    roomNumber: String,
    createdBy: String
}, {
    indexes: [{ key: { roomNumber: 1, createdBy: 1 }, unique: true }]
});
const RoomModel = mongoose.model('HotelRoom', RoomSchema, 'HotelRoom');

// Default Route
app.get('/', (req, res) => {
    res.send('Hotel Management Server is running...');
});

// Room CRUD Routes
app.get('/viewRooms', async (req, res) => {
    try {
        const userEmail = req.query.email;
        if (!userEmail) {
            return res.status(400).json({ error: 'User email is required' });
        }
        const rooms = await RoomModel.find({ createdBy: userEmail });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

app.post('/addRoom', async (req, res) => {
    try {
        const { guestName, hotel, roomNumber, createdBy } = req.body;
        if (!createdBy) {
            return res.status(400).json({ error: 'User email is required' });
        }
        if (!guestName || !hotel || !roomNumber) {
            return res.status(400).json({ error: 'All room fields are required' });
        }
        const newRoom = new RoomModel({ guestName, hotel, roomNumber, createdBy });
        await newRoom.save();
        res.json({ success: true, message: 'Room added successfully' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Room number already exists for this user' });
        } else {
            res.status(500).json({ error: 'Failed to add room' });
        }
    }
});

app.get('/findRoom/:id', async (req, res) => {
    try {
        const room = await RoomModel.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch room' });
    }
});

app.put('/editRoom/:id', async (req, res) => {
    try {
        const { guestName, hotel, roomNumber, createdBy } = req.body;
        const updatedRoom = await RoomModel.findByIdAndUpdate(
            req.params.id, 
            { guestName, hotel, roomNumber, createdBy }, 
            { new: true }
        );
        if (!updatedRoom) return res.status(404).json({ message: 'Room not found' });
        res.json({ success: true, message: 'Room updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update room' });
    }
});

app.delete('/deleteRoom/:id', async (req, res) => {
    try {
        const deletedRoom = await RoomModel.findByIdAndDelete(req.params.id);
        if (!deletedRoom) return res.status(404).json({ message: 'Room not found' });
        res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete room' });
    }
});

// User Routes (Signup and Login)
app.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, location, password } = req.body;
        if (!name || !email || !phone || !location || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (isNaN(phone)) {
            return res.status(400).json({ success: false, message: 'Phone must be a number' });
        }
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        const newUser = new UserModel({ name, email, phone: Number(phone), location, password });
        await newUser.save();
        res.json({ success: true, message: 'User registered successfully', user: { name, email } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to register user' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        if (user.password !== password) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }
        res.json({ success: true, message: 'Login successful', user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to login' });
    }
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
