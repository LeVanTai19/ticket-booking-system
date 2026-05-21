require ('dotenv').config();
const express = require('express');
const cors = require('cors');
const route = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

route(app);

app.listen(port, () =>{
    console.log(`Ticket Booking API is running at http://localhost:${port}`);
});