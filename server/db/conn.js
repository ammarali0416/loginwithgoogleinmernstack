const mongoose = require('mongoose');

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("database connection successful");
}).catch((err) => console.log("No connection"));