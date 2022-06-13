const express = require('express');
const { default: mongoose } = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(require('./routes'));

app.listen(PORT, () => console.log(`🌍 Connected on localhost:${PORT}`));

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pizza-hunt");

// for logging Mongo queries being executed
mongoose.set("debug", true);