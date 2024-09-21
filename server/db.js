const mongoose = require("mongoose");
const colors = require("colors");

const dbConnect = async () => {
  try {
    const connectionString = await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 10000
    });
    console.log(
      colors.yellow(`DB connected: ${connectionString.connection.host}\n`)
    );
  } catch (error) {
    console.log(error)
    console.log(colors.red("Connection to link DB failed\n"));
  }
};

module.exports = dbConnect;
