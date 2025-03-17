// PeerJS Initialization
const peer = new Peer();
const peerIdDisplay = document.getElementById("peer-id");
const peerIdInput = document.getElementById("peer-id-input");
const callButton = document.getElementById("call-button");
const copyIdButton = document.getElementById("copy-id");
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");
const muteButton = document.getElementById("mute-button");
const cameraButton = document.getElementById("camera-button");
const endCallButton = document.getElementById("end-call-button");

let localStream;
let currentCall;
let isMuted = false;
let isCameraOff = false;

// Show Peer ID
peer.on("open", (id) => {
    peerIdDisplay.innerText = id;
    callButton.disabled = false; // Enable call functionality
});

// Error Handling for PeerJS
peer.on("error", (err) => {
    console.error("PeerJS Error:", err);
    alert(`PeerJS Error: ${err.message}`);
});

// Copy Peer ID
copyIdButton.addEventListener("click", () => {
    navigator.clipboard.writeText(peerIdDisplay.innerText)
        .then(() => alert("Peer ID copied to clipboard"))
        .catch(() => alert("Failed to copy Peer ID!"));
});

// Access User Media
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        localStream = stream;
        localVideo.srcObject = stream;
        muteButton.disabled = false;
        cameraButton.disabled = false;
        endCallButton.disabled = false;
    })
    .catch((error) => {
        console.error("Error accessing media devices:", error);
        alert(`Unable to access camera and microphone: ${error.message}`);
    });

// Call a Peer
callButton.addEventListener("click", () => {
    const peerId = peerIdInput.value.trim();
    if (!peerId) return alert("Please enter a valid Peer ID");
    if (!localStream) return alert("Local stream not available");

    const call = peer.call(peerId, localStream);
    handleCall(call);
    callButton.disabled = true; // Disable call button while in a call
});

// Answer Incoming Calls
peer.on("call", (call) => {
    if (confirm("Incoming call. Accept?")) {
        if (!localStream) return alert("Local stream not available");
        call.answer(localStream);
        handleCall(call);
    } else {
        call.close();
    }
});

// Handle Calls
function handleCall(call) {
    if (currentCall) currentCall.close();
    currentCall = call;

    call.on("stream", (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
    });

    call.on("close", () => {
        remoteVideo.srcObject = null;
        callButton.disabled = false; // Re-enable call button after call ends
    });
}

// Mute / Unmute Audio
muteButton.addEventListener("click", () => {
    if (!localStream) return alert("Local stream not available");
    isMuted = !isMuted;
    localStream.getAudioTracks()[0].enabled = !isMuted;
    muteButton.innerText = isMuted ? "Unmute" : "Mute";
});

// Toggle Camera
cameraButton.addEventListener("click", () => {
    if (!localStream) return alert("Local stream not available");
    isCameraOff = !isCameraOff;
    localStream.getVideoTracks()[0].enabled = !isCameraOff;
    cameraButton.innerText = isCameraOff ? "Camera On" : "Camera Off";
});

// End Call
endCallButton.addEventListener("click", () => {
    if (currentCall) {
        currentCall.close();
        remoteVideo.srcObject = null;
        callButton.disabled = false; // Re-enable call button
    }
});
