/*
 * RETRO SYNTH WAVE PORTFOLIO - Music Player
 * Handles music playback functionality with retro UI
 */

document.addEventListener('DOMContentLoaded', () => {
    // Music player elements
    const musicPlayer = document.querySelector('.music-player');
    const playerToggle = document.querySelector('.player-toggle');
    const audioElement = document.getElementById('audio-element');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const trackTitle = document.querySelector('.track-title');
    const artistName = document.querySelector('.artist-name');
    const albumArt = document.querySelector('.album-art img');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const currentTime = document.querySelector('.current-time');
    const totalTime = document.querySelector('.total-time');
    const volumeControl = document.querySelector('.volume-control input');
    const visualizer = document.querySelector('.visualizer-container');
    const visualizerBars = document.querySelectorAll('.visualizer-bar');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const expandBtn = document.querySelector('.expand-btn');
    
    // Playlist of songs - customize with your own music
    const playlist = [
        {
            title: "Chill Synthwave",
            artist: "Lowtone Music",
            src: "music/chillsynth.mp3",
            cover: "music/covers/chillsynth.jpg"
        },
        {
            title: "Synthwave Dark",
            artist: "Lowtone Music",
            src: "music/synthdark.mp3",
            cover: "music/covers/synthdark.jpg"
        },
        {
            title: "Synthwave Cyberpunk",
            artist: "Elysium Sound",
            src: "music/elysium.mp3",
            cover: "music/covers/elysium.jpg"
        },
        {
            title: "Synthwave Cyberpunk",
            artist: "Elysium Sound",
            src: "music/voyage.mp3",
            cover: "music/covers/voyage.jpg"
        },
        // Add more tracks as needed
    ];
    
    // Current track index
    let currentTrackIndex = 0;
    let isPlaying = false;
    let visualizerActive = false;
    let isExpanded = false;
    
    // Initialize player
    function initPlayer() {
        // Load first track
        loadTrack(currentTrackIndex);
        
        // Set initial volume
        if (audioElement && volumeControl) {
            audioElement.volume = 0.5;
            volumeControl.value = 0.5;
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Create playlist items
        createPlaylistItems();
        
        // Setup audio context for visualizer
        setupVisualizer();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Play button
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                playTrack();
            });
        }
        
        // Pause button
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                pauseTrack();
            });
        }
        
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevTrack();
            });
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextTrack();
            });
        }
        
        // Progress bar click
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
                const progressBarWidth = progressBar.clientWidth;
                const seekPercentage = clickPosition / progressBarWidth;
                audioElement.currentTime = seekPercentage * audioElement.duration;
            });
        }
        
        // Volume control
        if (volumeControl) {
            volumeControl.addEventListener('input', () => {
                audioElement.volume = volumeControl.value;
            });
        }
        
        // Audio element time update
        if (audioElement) {
            audioElement.addEventListener('timeupdate', updateProgress);
            audioElement.addEventListener('ended', () => {
                nextTrack();
            });
            audioElement.addEventListener('canplay', () => {
                updateTotalTime();
            });
        }
        
        // Toggle player view
        if (playerToggle) {
            playerToggle.addEventListener('click', () => {
                togglePlayerView();
            });
        }
        
        // Expand/collapse button
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                toggleExpand();
            });
        }
        
        // Theme change event listener
        document.addEventListener('themechange', (e) => {
            // Update visualizer colors based on theme
            if (visualizerBars && visualizerBars.length > 0) {
                const themeColors = e.detail.colors;
                updateVisualizerColors(themeColors);
            }
        });
    }
    
    // Toggle expand/collapse player
    function toggleExpand() {
        if (!musicPlayer) return;
        
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            musicPlayer.classList.add('expanded');
            expandBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        } else {
            musicPlayer.classList.remove('expanded');
            expandBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        }
    }
    
    // Toggle player view (minimized/shown)
    function togglePlayerView() {
        if (!musicPlayer) return;
        
        musicPlayer.classList.toggle('minimized');
        
        if (musicPlayer.classList.contains('minimized')) {
            playerToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            playerToggle.innerHTML = '<i class="fas fa-times"></i>';
        }
    }
    
    // Load track by index
    function loadTrack(index) {
        if (!audioElement || !playlist[index]) return;
        
        currentTrackIndex = index;
        
        // Update audio source
        audioElement.src = playlist[index].src;
        audioElement.load();
        
        // Update track info
        if (trackTitle) trackTitle.textContent = playlist[index].title;
        if (artistName) artistName.textContent = playlist[index].artist;
        if (albumArt) albumArt.src = playlist[index].cover;
        
        // Reset progress
        if (progressFill) progressFill.style.width = '0%';
        if (currentTime) currentTime.textContent = '0:00';
        
        // Update active playlist item
        updateActivePlaylistItem();
    }
    
    // Replace your playTrack function with this updated version
function playTrack() {
    if (!audioElement) return;
    
    // First, make sure audio context is initialized
    if (audioContext && audioContext.state !== 'running') {
        // Resume audio context (this is allowed within a user gesture like a click)
        audioContext.resume().then(() => {
            // Only initialize the analyzer if it hasn't been done yet
            if (!analyser) {
                try {
                    analyser = audioContext.createAnalyser();
                    
                    // Connect audio element to analyser
                    const source = audioContext.createMediaElementSource(audioElement);
                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    
                    // Set up analyser
                    analyser.fftSize = 128;
                    const bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                    
                    // Create visualizer bars
                    createVisualizerBars(bufferLength);
                    
                    // Get theme colors
                    const themeColors = window.getThemeColors ? window.getThemeColors() : {
                        highlight: '#00F0FF',
                        accent: '#FF41B4',
                        secondary1: '#A359FF',
                        secondary2: '#FFDE59'
                    };
                    
                    updateVisualizerColors(themeColors);
                    
                    // Now play the audio
                    continuePlayback();
                } catch (error) {
                    console.error('Failed to setup audio analyzer:', error);
                    // Still try to play audio even if visualizer fails
                    continuePlayback();
                }
            } else {
                // Analyzer already initialized, just play
                continuePlayback();
            }
        }).catch(error => {
            console.error('Failed to resume audio context:', error);
            // Show a more helpful message to the user
            showAudioHelpMessage();
        });
    } else {
        // Audio context is already running or not needed
        continuePlayback();
    }
}
// Helper function to continue with playback after context is ready
function continuePlayback() {
    audioElement.play().then(() => {
        isPlaying = true;
        
        // Update UI
        if (playBtn) playBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'block';
        if (albumArt) albumArt.classList.add('spinning');
        
        // Add playing class to player
        if (musicPlayer) musicPlayer.classList.add('playing');
        
        // Start visualizer
        startVisualizer();
        
    }).catch(error => {
        console.error('Playback failed:', error);
        showAudioHelpMessage();
    });
}

// Function to show a helpful message when audio can't be played
function showAudioHelpMessage() {
    // Create message element if it doesn't exist
    if (!document.getElementById('audio-help-message')) {
        const messageEl = document.createElement('div');
        messageEl.id = 'audio-help-message';
        messageEl.className = 'audio-help-message';
        messageEl.innerHTML = `
            <div class="audio-help-content">
                <h3>Enable Audio Playback</h3>
                <p>To play music, please interact with the page first:</p>
                <ol>
                    <li>Click anywhere on the page</li>
                    <li>Then try playing music again</li>
                </ol>
                <button id="audio-help-close">Got it</button>
                <button id="audio-help-enable">Enable Audio</button>
            </div>
        `;
        document.body.appendChild(messageEl);
        
        // Add interaction handlers for the message
        document.getElementById('audio-help-close').addEventListener('click', () => {
            messageEl.style.display = 'none';
        });
        
        document.getElementById('audio-help-enable').addEventListener('click', () => {
            // This button click itself is a user interaction that will enable audio
            if (audioContext) {
                audioContext.resume().then(() => {
                    messageEl.style.display = 'none';
                    // Try playing again
                    continuePlayback();
                });
            } else {
                messageEl.style.display = 'none';
                // Try playing without audio context
                continuePlayback();
            }
        });
    } else {
        // Show the message if it already exists
        document.getElementById('audio-help-message').style.display = 'flex';
    }
}
    
    // Pause current track
    function pauseTrack() {
        if (!audioElement) return;
        
        audioElement.pause();
        isPlaying = false;
        
        // Update UI
        if (playBtn) playBtn.style.display = 'block';
        if (pauseBtn) pauseBtn.style.display = 'none';
        if (albumArt) albumArt.classList.remove('spinning');
        
        // Stop visualizer
        stopVisualizer();
    }
    
    // Play next track
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        
        if (isPlaying) {
            playTrack();
        }
    }
    
    // Play previous track
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(currentTrackIndex);
        
        if (isPlaying) {
            playTrack();
        }
    }
    
    // Update progress bar
    function updateProgress() {
        if (!audioElement || !progressFill || !currentTime) return;
        
        const currentTimeValue = audioElement.currentTime;
        const duration = audioElement.duration || 0;
        const progressPercentage = (currentTimeValue / duration) * 100;
        
        // Update progress bar width
        progressFill.style.width = `${progressPercentage}%`;
        
        // Update current time display
        const minutes = Math.floor(currentTimeValue / 60);
        const seconds = Math.floor(currentTimeValue % 60).toString().padStart(2, '0');
        currentTime.textContent = `${minutes}:${seconds}`;
        
        // Update visualizer if active
        if (visualizerActive) {
            updateVisualizerBars();
        }
    }
    
    // Update total time display
    function updateTotalTime() {
        if (!audioElement || !totalTime) return;
        
        const duration = audioElement.duration || 0;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
        totalTime.textContent = `${minutes}:${seconds}`;
    }
    
    // Create playlist items
    function createPlaylistItems() {
        const playlistContainer = document.querySelector('.playlist-container');
        if (!playlistContainer) return;
        
        // Clear existing items
        playlistContainer.innerHTML = '';
        
        // Create playlist items
        playlist.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (index === currentTrackIndex) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="playlist-item-number">${index + 1}</div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${track.title}</div>
                    <div class="playlist-item-artist">${track.artist}</div>
                </div>
            `;
            
            // Add click event
            item.addEventListener('click', () => {
                loadTrack(index);
                playTrack();
            });
            
            playlistContainer.appendChild(item);
        });
    }
    
    // Update active playlist item
    function updateActivePlaylistItem() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        
        playlistItems.forEach((item, index) => {
            if (index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Audio Visualizer
    let audioContext, analyser, dataArray;
    
    // Set up audio visualizer with proper initialization
function setupVisualizer() {
    if (!audioElement || !visualizer) return;
    
    // Create audio context but don't connect anything yet
    try {
        // Create but don't start the audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Suspend it immediately - we'll resume it on user interaction
        if (audioContext.state === 'running') {
            audioContext.suspend();
        }
        
        // Setup will be completed on first play click
        // Setup is deferred to the first user interaction
    } catch (error) {
        console.error('Audio visualizer error:', error);
        // Hide visualizer on error
        if (visualizer) visualizer.style.display = 'none';
    }
}

    // Add this helper function to initialize audio properly on page load 
function initAudioPermission() {
    // Add an invisible button that will initialize audio context
    const audioInitButton = document.createElement('button');
    audioInitButton.id = 'audio-init-button';
    audioInitButton.innerText = 'Initialize Audio';
    audioInitButton.style.position = 'fixed';
    audioInitButton.style.bottom = '10px';
    audioInitButton.style.right = '10px';
    audioInitButton.style.zIndex = '9999';
    audioInitButton.style.padding = '5px 10px';
    audioInitButton.style.background = 'var(--accent-color)';
    audioInitButton.style.color = 'var(--text-light)';
    audioInitButton.style.border = 'none';
    audioInitButton.style.borderRadius = '4px';
    audioInitButton.style.cursor = 'pointer';
    audioInitButton.style.boxShadow = '0 0 10px var(--accent-color)';
    audioInitButton.style.display = 'none'; // Hidden by default
    
    // Show the button if user tries to play first
    document.body.addEventListener('click', function() {
        if (audioContext && audioContext.state !== 'running') {
            audioInitButton.style.display = 'block';
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                audioInitButton.style.display = 'none';
            }, 10000);
        }
    }, { once: true });
    
    audioInitButton.addEventListener('click', function() {
        if (audioContext) {
            audioContext.resume().then(() => {
                audioInitButton.style.display = 'none';
                alert('Audio is now enabled! You can play music.');
            });
        }
        this.style.display = 'none';
    });
    
    document.body.appendChild(audioInitButton);
}
    // Create visualizer bars
    function createVisualizerBars(count) {
        if (!visualizer) return;
        
        // Clear existing bars
        visualizer.innerHTML = '';
        
        // Number of bars to create (use fewer than the actual data points)
        const barCount = Math.min(32, count / 2);
        
        // Create bars
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            visualizer.appendChild(bar);
        }
    }
    
    // Start visualizer animation
    function startVisualizer() {
        if (!audioContext || !analyser || !visualizer) return;
        
        visualizerActive = true;
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // Start animation
        updateVisualizerBars();
    }
    
    // Stop visualizer animation
    function stopVisualizer() {
        visualizerActive = false;
    }
    
    // Update visualizer bars
    function updateVisualizerBars() {
        if (!visualizerActive || !analyser || !visualizer) return;
        
        // Get frequency data
        analyser.getByteFrequencyData(dataArray);
        
        // Get all bars
        const bars = visualizer.querySelectorAll('.visualizer-bar');
        
        // Step size to sample from the frequency data
        const step = Math.floor(dataArray.length / bars.length);
        
        // Update each bar height
        bars.forEach((bar, index) => {
            // Get data point
            const dataIndex = index * step;
            let value = dataArray[dataIndex] || 0;
            
            // Calculate height percentage (0-100)
            const height = Math.max(3, (value / 255) * 100);
            
            // Apply height
            bar.style.height = `${height}%`;
        });
        
        // Continue animation if still active
        if (visualizerActive) {
            requestAnimationFrame(updateVisualizerBars);
        }
    }
    
    // Update visualizer colors based on theme
    function updateVisualizerColors(themeColors) {
        if (!visualizer) return;
        
        const bars = visualizer.querySelectorAll('.visualizer-bar');
        const colors = [
            themeColors.accent,
            themeColors.highlight,
            themeColors.secondary1,
            themeColors.secondary2
        ];
        
        bars.forEach((bar, index) => {
            // Cycle through the colors
            const colorIndex = index % colors.length;
            bar.style.backgroundColor = colors[colorIndex];
            bar.style.boxShadow = `0 0 10px ${colors[colorIndex]}`;
        });
    }
    
    // Initialize player when document is ready
    initPlayer();
    //initAudioPermission();
    
});
