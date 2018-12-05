function Chat(){
    this.chatConnection;
    this.chatChannel;

    this.startRTCPeerConnection = function(){
        this.chatConnection = new RTCPeerConnection();
        this.chatChannel = this.chatConnection.createDataChannel("chatChannel");
    }
}