const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

const PORT = process.env.PORT;

app.get('/', (req,res)=>{
    res.json({message: 'API is running...'});
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})