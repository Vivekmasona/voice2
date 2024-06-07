<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WebRTC Call</title>
</head>
<body>
    <h1>WebRTC Call</h1>
    <audio id="remoteAudio" autoplay></audio>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const audioElement = document.getElementById('remoteAudio');
        let peerConnection;

        const configuration = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        };

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                peerConnection = new RTCPeerConnection(configuration);
                stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

                peerConnection.ontrack = event => {
                    audioElement.srcObject = event.streams[0];
                };

                peerConnection.onicecandidate = event => {
                    if (event.candidate) {
                        socket.emit('candidate', event.candidate);
                    }
                };

                socket.on('offer', async (offer) => {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    socket.emit('answer', answer);
                });

                socket.on('answer', async (answer) => {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                });

                socket.on('candidate', async (candidate) => {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                });

                socket.emit('ready');
            })
            .catch(error => {
                console.error('Error accessing media devices:', error);
            });

        socket.on('ready', async () => {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer);
        });
    </script>
</body>
</html>
