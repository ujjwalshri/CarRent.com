const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 9000;

app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

