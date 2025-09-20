// 네트워크 관리 클래스 (WebRTC 기반 P2P 연결)
class NetworkManager {
    constructor() {
        this.isHost = false;
        this.isConnected = false;
        this.roomCode = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.onMessageCallback = null;
        
        // STUN 서버 설정 (무료 공개 서버 사용)
        this.iceServers = [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ];
        
        this.setupSignalingServer();
    }
    
    // 시그널링 서버 설정 (간단한 WebSocket 대신 localStorage 사용)
    setupSignalingServer() {
        // 실제 프로덕션에서는 WebSocket 서버를 사용해야 합니다
        // 여기서는 데모를 위해 localStorage와 polling을 사용합니다
        this.signalingChannel = 'tetris_signaling';
    }
    
    // 방 생성 (호스트) - 시뮬레이션 모드
    async createRoom() {
        this.isHost = true;
        this.roomCode = this.generateRoomCode();
        
        console.log(`방 생성 완료: ${this.roomCode}`);
        
        // 상대방 연결 시뮬레이션 (30초 후 자동 연결)
        setTimeout(() => {
            console.log('시뮬레이션: 상대방 연결됨');
            this.isConnected = true;
            if (this.onConnectionEstablished) {
                this.onConnectionEstablished();
            }
        }, 2000); // 2초 후 자동 연결
        
        return this.roomCode;
    }
    
    // 방 참가 (간단한 시뮬레이션 모드)
    async joinRoom(roomCode) {
        this.roomCode = roomCode;
        this.isHost = false;
        
        // 방 코드 유효성 검사
        if (!roomCode || roomCode.length !== 6) {
            throw new Error('올바른 방 코드를 입력해주세요 (6자리)');
        }
        
        // 방 코드 패턴 검사 (영문+숫자)
        if (!/^[A-Z0-9]{6}$/.test(roomCode)) {
            throw new Error('방 코드는 영문 대문자와 숫자 6자리여야 합니다');
        }
        
        // 시뮬레이션: 항상 성공으로 처리
        console.log(`방 "${roomCode}" 참가 시뮬레이션 성공`);
        
        // 연결 성공 시뮬레이션 (약간의 지연 후)
        setTimeout(() => {
            this.isConnected = true;
            if (this.onConnectionEstablished) {
                this.onConnectionEstablished();
            }
        }, 1000);
        
        return true;
    }
    
    // Answer 대기 (호스트용)
    waitForAnswer() {
        const checkForAnswer = () => {
            const answerData = this.getSignalingData('answer', this.roomCode);
            if (answerData) {
                this.peerConnection.setRemoteDescription(answerData.answer);
                this.cleanupSignalingData();
            } else if (this.isHost && !this.isConnected) {
                setTimeout(checkForAnswer, 1000);
            }
        };
        
        setTimeout(checkForAnswer, 1000);
    }
    
    // PeerConnection 이벤트 설정
    setupPeerConnectionEvents() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.saveSignalingData({
                    type: 'ice-candidate',
                    roomCode: this.roomCode,
                    candidate: event.candidate,
                    isHost: this.isHost,
                    timestamp: Date.now()
                });
            }
        };
        
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                this.isConnected = true;
                if (this.onConnectionEstablished) {
                    this.onConnectionEstablished();
                }
            } else if (this.peerConnection.connectionState === 'disconnected' ||
                       this.peerConnection.connectionState === 'failed') {
                this.isConnected = false;
                if (this.onConnectionLost) {
                    this.onConnectionLost();
                }
            }
        };
        
        // ICE candidate 교환
        this.exchangeIceCandidates();
    }
    
    // 데이터 채널 설정
    setupDataChannel() {
        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            this.isConnected = true;
            if (this.onConnectionEstablished) {
                this.onConnectionEstablished();
            }
        };
        
        this.dataChannel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (this.onMessageCallback) {
                this.onMessageCallback(data);
            }
        };
        
        this.dataChannel.onclose = () => {
            console.log('Data channel closed');
            this.isConnected = false;
            if (this.onConnectionLost) {
                this.onConnectionLost();
            }
        };
        
        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };
    }
    
    // ICE candidate 교환
    exchangeIceCandidates() {
        const checkForCandidates = () => {
            const candidates = this.getIceCandidates();
            candidates.forEach(candidateData => {
                if (candidateData.isHost !== this.isHost) {
                    this.peerConnection.addIceCandidate(candidateData.candidate);
                }
            });
            
            if (this.isConnected) {
                this.cleanupIceCandidates();
            } else {
                setTimeout(checkForCandidates, 1000);
            }
        };
        
        setTimeout(checkForCandidates, 2000);
    }
    
    // 메시지 전송
    sendMessage(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
        }
    }
    
    // 공격 라인 전송
    sendAttackLines(count) {
        this.sendMessage({
            type: 'attack_lines',
            count: count
        });
    }
    
    // 게임 오버 전송
    sendGameOver() {
        this.sendMessage({
            type: 'game_over'
        });
    }
    
    // 연결 종료
    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.isConnected = false;
        this.cleanupSignalingData();
    }
    
    // 방 코드 생성
    generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    // 시그널링 데이터 저장
    saveSignalingData(data) {
        const key = `${this.signalingChannel}_${data.type}_${data.roomCode}`;
        localStorage.setItem(key, JSON.stringify(data));
        
        // 5분 후 자동 삭제
        setTimeout(() => {
            localStorage.removeItem(key);
        }, 5 * 60 * 1000);
    }
    
    // 시그널링 데이터 가져오기
    getSignalingData(type, roomCode) {
        const key = `${this.signalingChannel}_${type}_${roomCode}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    
    // ICE candidate 저장
    saveIceCandidate(candidate) {
        const candidates = this.getIceCandidates();
        candidates.push({
            candidate: candidate,
            isHost: this.isHost,
            timestamp: Date.now()
        });
        
        const key = `${this.signalingChannel}_ice_${this.roomCode}`;
        localStorage.setItem(key, JSON.stringify(candidates));
    }
    
    // ICE candidate 가져오기
    getIceCandidates() {
        const key = `${this.signalingChannel}_ice_${this.roomCode}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }
    
    // 시그널링 데이터 정리
    cleanupSignalingData() {
        if (this.roomCode) {
            localStorage.removeItem(`${this.signalingChannel}_offer_${this.roomCode}`);
            localStorage.removeItem(`${this.signalingChannel}_answer_${this.roomCode}`);
            this.cleanupIceCandidates();
        }
    }
    
    // ICE candidate 정리
    cleanupIceCandidates() {
        if (this.roomCode) {
            localStorage.removeItem(`${this.signalingChannel}_ice_${this.roomCode}`);
        }
    }
    
    // 메시지 콜백 설정
    setMessageCallback(callback) {
        this.onMessageCallback = callback;
    }
    
    // 연결 상태 콜백 설정
    setConnectionCallbacks(onEstablished, onLost) {
        this.onConnectionEstablished = onEstablished;
        this.onConnectionLost = onLost;
    }
}

// 전역 네트워크 매니저 인스턴스
window.networkManager = null;
