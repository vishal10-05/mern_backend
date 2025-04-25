const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Schema Definition
const RoomSchema = new mongoose.Schema({
    name: String,
    hotel: String,
    roomNo: Number
});

// Model Definition
const RoomModel = mongoose.model("HotelRoom", RoomSchema, "HotelRoom");

// Database Connection
mongoose.connect('mongodb://localhost:27017/DemoApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('DB connected'))
    .catch(err => console.log(err));

// RESTful APIs
app.post('/addRoom', async (req, res) => {
    try {
        await RoomModel.create(req.body);
        res.json({ message: 'Room Added Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/viewRooms', async (req, res) => {
    try {
        const records = await RoomModel.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/findRoom/:id', async (req, res) => {
    try {
        const record = await RoomModel.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/editRoom/:id', async (req, res) => {
    try {
        const updatedRoom = await RoomModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room Updated Successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/deleteRoom/:id', async (req, res) => {
    try {
        const deletedItem = await RoomModel.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room Deleted Successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
