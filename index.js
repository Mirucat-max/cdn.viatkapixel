const { Telegraf, Markup } = require("telegraf")
const bot = new Telegraf(/*"5911975320:AAFYiK-gJ1BcUirkEyCebTTQy1VcUqxoEdY"*/ "6197591525:AAGsDMqEPu-l7KzAAYJVciDQO8l1yuoS9hw")
const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "https://pixelviatka.onrender.com",
    methods: ["GET", "POST"]
  }
});
const fs = require('fs');
let pixels = require("./polotno.json");

io.on("connection", (socket) => {
  socket.on("get_pixels", async (bimba) => {
    socket.emit("get_pixels", pixels)
  })
  socket.on("add_pixels", async (pixelsToAdd) => {
    for (let x in pixelsToAdd) {
      if (!pixels[x])
        pixels[x] = {};

      for (let y in pixelsToAdd[x]) {
        pixels[x][y] = pixelsToAdd[x][y];
      }
    }
    fs.writeFileSync(__dirname + "/polotno.json", JSON.stringify(pixels));
    io.sockets.emit("add_pixels", pixelsToAdd)
  })
  socket.on("delete_pixels", (pixelsToBeDeleted) => {
    for (let x in pixelsToBeDeleted) {
      if (!pixels[x])
        continue;

      for (let y in pixelsToBeDeleted[x]) {
        delete pixels[x][y];
      }

      if (Object.keys(pixels[x]).length === 0)
        delete pixels[x];
    }
    fs.writeFileSync(__dirname + "/polotno.json", JSON.stringify(pixels));
    socket.broadcast.emit("delete_pixels", pixelsToBeDeleted);
  });
})

bot.on("document", async (context) => {
  let doc = Buffer.from(await(
    await fetch(
      await bot.telegram.getFileLink(
        context.message.document.file_id
      )
    )
  ).arrayBuffer());
  console.log(doc);
  fs.writeFileSync(__dirname + "/polotno.json",doc, "binary");
})

setInterval(() => {
  bot.telegram.sendDocument(540186959, { source: "./polotno.json" })
}, 5 * 60 * 1000);

bot.launch()

server.listen(process.env.PORT || 4000, () => {
  console.log(`listening on port ${process.env.PORT || 4000} _<`)
})

console.log("Started _<")
