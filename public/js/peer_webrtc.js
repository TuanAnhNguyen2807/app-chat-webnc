const socket = io("/");
let myVideoStream;
const myPeer = new Peer();
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const backBtn = document.querySelector(".header__back");
myVideo.muted = true;
const peers = {};
let user = prompt("Enter Your Name");
while (user.length == 0) {
	alert("Please enter your name!");
	user = prompt("What's your name?");
}
navigator.mediaDevices
	.getUserMedia({
		audio: true,
		video: {
			width: { min: 1024, ideal: 1280, max: 1920 },
			height: { min: 576, ideal: 720, max: 1080 },
		},
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream, user);
		myPeer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				setTimeout(() => {
					addVideoStream(
						video,
						userVideoStream,
						call.metadata.userName
					);
				}, 1500);
				socket.on("user-disconnected", (userId, userName) => {
					setTimeout(() => {
						deleteStream(video, userVideoStream);
					}, 1000);
					alert_room(
						`${titleCase(userName)} đã rời khỏi cuộc trò chuyện`
					);
				});
			});
		});
		socket.on("user-connected", (userId, userName) => {
			setTimeout(() => {
				connectToNewUser(userId, stream, userName);
			}, 1500);
			alert_room(`${titleCase(userName)} đã tham gia cuộc trò chuyện`);
		});
	});

socket.on("user-disconnected", (userId, userName) => {
	if (peers[userId]) {
		peers[userId].close();
	}
	alert_room(`${titleCase(userName)} đã rời khỏi cuộc trò chuyện`);
});

myPeer.on("open", (id) => {
	socket.emit("join-room", ROOM_ID, id, user);
});

function connectToNewUser(userId, stream, userName) {
	const call = myPeer.call(userId, stream, {
		metadata: { userName: user },
	});
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream, userName);
	});
	call.on("close", () => {
		video.remove();
	});
	peers[userId] = call;
}

function addVideoStream(video, stream, userName) {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
		let divVideoContainer = document.createElement("div");
		divVideoContainer.classList.add("video-container");
		divName = document.createElement("div");
		divName.classList.add("overlay");
		divName.innerHTML = `<span class="Material-icons">person</span>${titleCase(
			userName
		)}`;
		divVideoContainer.append(divName);
		divVideoContainer.append(video);
		videoGrid.append(divVideoContainer);
	});
}
function deleteStream(video, stream) {
	video.srcObject = stream;
	let video_container = document.querySelectorAll(".video-container");
	let video_container_list = [...video_container];
	for (var i = 0, len = video_container_list.length; i < len; i++) {
		if (video_container[i].querySelector("video") === video) {
			video_container[i].remove();
		}
	}
}
function alert_room(msg) {
	let alertJoin = document.querySelector(".alert");
	alertJoin.innerHTML = msg;
	alertJoin.style.visibility = "visible";
	setTimeout(() => {
		alertJoin.style.visibility = "hidden";
	}, 1500);
}
function titleCase(str) {
	var splitStr = str.toLowerCase().split(" ");
	for (var i = 0; i < splitStr.length; i++) {
		splitStr[i] =
			splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
	}
	return splitStr.join(" ");
}
const inviteButton = document.getElementById("inviteButton");
const muteButton = document.querySelector("#miceMuteUnmute");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
	setTimeout(() => {
		const enabled = myVideoStream.getAudioTracks()[0].enabled;
		if (enabled) {
			myVideoStream.getAudioTracks()[0].enabled = false;
			html = `<span class="material-icons">mic_off</span>`;
			muteButton.innerHTML = html;
		} else {
			myVideoStream.getAudioTracks()[0].enabled = true;
			html = `<span class="material-icons">mic</span>`;
			muteButton.innerHTML = html;
		}
	}, 300);
});

stopVideo.addEventListener("click", () => {
	setTimeout(() => {
		const enabled = myVideoStream.getVideoTracks()[0].enabled;
		if (enabled) {
			myVideoStream.getVideoTracks()[0].enabled = false;
			html = `<span class="material-icons">videocam_off</span>`;
			stopVideo.innerHTML = html;
		} else {
			myVideoStream.getVideoTracks()[0].enabled = true;
			html = `<span class="material-icons">videocam</span>`;
			stopVideo.innerHTML = html;
		}
	}, 300);
});

inviteButton.addEventListener("click", (e) => {
	href_room = window.location.href.split("/");
	id_room = href_room[href_room.length - 1];
	prompt(
		"Copy this Id room and send it to people you want to meet with",
		id_room
	);
});

let text = document.getElementById("msgbox");
let send = document.getElementById("btnsend");
let messages = document.getElementById("messages");

send.addEventListener("click", (e) => {
	if (text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

text.addEventListener("keydown", (e) => {
	if (e.key === "Enter" && text.value.length !== 0) {
		socket.emit("message", text.value);
		text.value = "";
	}
});

socket.on("createMessage", (message, userName) => {
	messages.innerHTML =
		messages.innerHTML +
		`<div class="message">
					  <b><i class="far fa-user-circle"></i> <span> ${titleCase(
							userName === user ? "Me" : userName
						)}</span></b>
					  <span>: ${message}</span>
				  </div>`;
});
