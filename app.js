const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("home");
});

app.get("/room", (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get("/:roomId", (req, res) => {
	let clients = io.sockets.adapter.rooms;
	clients.forEach((element, index) => {
		if (index === req.params.roomId) {
			if (element.size > 5) {
				return res.render("limit_err");
			}
		}
	});
	return res.render("room", {
		roomId: req.params.roomId,
	});
});

io.on("connection", (socket) => {
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		io.to(roomId).emit("user-connected", userId, userName);
		socket.on("disconnect", () => {
			io.to(roomId).emit("user-disconnected", userId, userName);
		});
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});
	});
});

server.listen(process.env.PORT || 3000, function () {
	console.log("Server is running in http://localhost:3000");
});
