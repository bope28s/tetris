// 오디오 매니저 클래스
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        this.backgroundMusic = null;
        this.isMusicPlaying = false;
        this.isMuted = false;
        
        this.initializeAudio();
    }
    
    // 오디오 컨텍스트 초기화
    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 사용자 상호작용 후 오디오 컨텍스트 활성화
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
            // 배경음악 생성
            this.createBackgroundMusic();
            
        } catch (error) {
            console.warn('오디오 초기화 실패:', error);
        }
    }
    
    // 러시아 민요풍 배경음악 생성 (Korobeiniki - 테트리스 테마)
    createBackgroundMusic() {
        if (!this.audioContext) return;
        
        // 테트리스 테마 멜로디 (Korobeiniki)
        const melody = [
            { note: 'E5', duration: 0.5 },
            { note: 'B4', duration: 0.25 },
            { note: 'C5', duration: 0.25 },
            { note: 'D5', duration: 0.5 },
            { note: 'C5', duration: 0.25 },
            { note: 'B4', duration: 0.25 },
            { note: 'A4', duration: 0.5 },
            { note: 'A4', duration: 0.25 },
            { note: 'C5', duration: 0.25 },
            { note: 'E5', duration: 0.5 },
            { note: 'D5', duration: 0.25 },
            { note: 'C5', duration: 0.25 },
            { note: 'B4', duration: 0.75 },
            { note: 'C5', duration: 0.25 },
            { note: 'D5', duration: 0.5 },
            { note: 'E5', duration: 0.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'A4', duration: 1 },
            
            { note: 'D5', duration: 0.5 },
            { note: 'F5', duration: 0.25 },
            { note: 'A5', duration: 0.5 },
            { note: 'G5', duration: 0.25 },
            { note: 'F5', duration: 0.25 },
            { note: 'E5', duration: 0.75 },
            { note: 'C5', duration: 0.25 },
            { note: 'E5', duration: 0.5 },
            { note: 'D5', duration: 0.25 },
            { note: 'C5', duration: 0.25 },
            { note: 'B4', duration: 0.75 },
            { note: 'C5', duration: 0.25 },
            { note: 'D5', duration: 0.5 },
            { note: 'E5', duration: 0.5 },
            { note: 'C5', duration: 0.5 },
            { note: 'A4', duration: 0.5 },
            { note: 'A4', duration: 1 }
        ];
        
        this.melody = melody;
        this.currentNoteIndex = 0;
        this.tempo = 120; // BPM
    }
    
    // 음표 주파수 매핑
    getNoteFrequency(note) {
        const noteFrequencies = {
            'A4': 440,
            'B4': 493.88,
            'C5': 523.25,
            'D5': 587.33,
            'E5': 659.25,
            'F5': 698.46,
            'G5': 783.99,
            'A5': 880
        };
        return noteFrequencies[note] || 440;
    }
    
    // 배경음악 재생
    playBackgroundMusic() {
        if (!this.audioContext || this.isMuted || this.isMusicPlaying) return;
        
        this.isMusicPlaying = true;
        this.currentNoteIndex = 0;
        this.playNextNote();
    }
    
    // 다음 음표 재생
    playNextNote() {
        if (!this.isMusicPlaying || !this.audioContext) return;
        
        const note = this.melody[this.currentNoteIndex];
        const frequency = this.getNoteFrequency(note.note);
        const duration = (note.duration * 60 / this.tempo) * 1000; // ms로 변환
        
        // 오실레이터 생성
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // 볼륨 설정 (ADSR 엔벨로프 적용)
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.musicVolume * this.masterVolume * 0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(this.musicVolume * this.masterVolume * 0.1, now + duration / 1000 - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
        
        oscillator.start(now);
        oscillator.stop(now + duration / 1000);
        
        // 다음 음표로 진행
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
        
        setTimeout(() => {
            this.playNextNote();
        }, duration);
    }
    
    // 배경음악 정지
    stopBackgroundMusic() {
        this.isMusicPlaying = false;
    }
    
    // 블록 착지 효과음
    playBlockLandSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }
    
    // 라인 클리어 효과음
    playLineClear() {
        if (!this.audioContext || this.isMuted) return;
        
        // 상승하는 톤
        const oscillator1 = this.audioContext.createOscillator();
        const gainNode1 = this.audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(this.audioContext.destination);
        
        oscillator1.type = 'sine';
        const now = this.audioContext.currentTime;
        
        oscillator1.frequency.setValueAtTime(200, now);
        oscillator1.frequency.linearRampToValueAtTime(400, now + 0.1);
        oscillator1.frequency.linearRampToValueAtTime(600, now + 0.2);
        oscillator1.frequency.linearRampToValueAtTime(800, now + 0.3);
        
        gainNode1.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.4, now);
        gainNode1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        oscillator1.start(now);
        oscillator1.stop(now + 0.3);
        
        // 하모닉 추가
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        
        oscillator2.type = 'triangle';
        oscillator2.frequency.setValueAtTime(100, now);
        oscillator2.frequency.linearRampToValueAtTime(200, now + 0.1);
        oscillator2.frequency.linearRampToValueAtTime(300, now + 0.2);
        oscillator2.frequency.linearRampToValueAtTime(400, now + 0.3);
        
        gainNode2.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, now);
        gainNode2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        oscillator2.start(now);
        oscillator2.stop(now + 0.3);
    }
    
    // 블록 회전 효과음
    playRotateSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(350, this.audioContext.currentTime + 0.05);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }
    
    // 블록 이동 효과음
    playMoveSound() {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        
        oscillator.start(now);
        oscillator.stop(now + 0.03);
    }
    
    // 게임 오버 효과음
    playGameOverSound() {
        if (!this.audioContext || this.isMuted) return;
        
        // 하강하는 톤
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        const now = this.audioContext.currentTime;
        
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 1.0);
        
        gainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume * 0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        oscillator.start(now);
        oscillator.stop(now + 1.0);
    }
    
    // 음소거 토글
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
    }
    
    // 볼륨 설정
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }
}

// 전역 오디오 매니저 인스턴스
window.audioManager = null;
