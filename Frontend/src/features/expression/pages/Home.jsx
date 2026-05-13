import React, { useState, useEffect } from 'react';
import '../styles/home.scss';
import { useAuth } from '../../auth/hooks/useAuth';
import FaceExpression from '../component/FaceExpression';
import { api } from '../../auth/services/auth.api.js';

const Home = () => {
    const { user, handleLogout } = useAuth();
    const [currentMood, setCurrentMood] = useState(null);

    const [recommendedSongs, setRecommendedSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = React.useRef(null);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadMood, setUploadMood] = useState('happy');
    const [isUploading, setIsUploading] = useState(false);

    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'
    
    const [activeView, setActiveView] = useState('home'); // 'home', 'all-songs', 'mood-playlist', 'moods-grid'
    const [selectedMoodTab, setSelectedMoodTab] = useState('happy');

    const [editingSong, setEditingSong] = useState(null);
    const [songToDelete, setSongToDelete] = useState(null);

    const fetchSongs = async (mood) => {
        if (!mood) return; // Prevent autoplay on login

        try {
            const moodMap = {
                Happy: 'happy',
                Sad: 'sad',
                Angry: 'angry',
                Surprised: 'energetic',
                Drowsy: 'calm',
                Neutral: 'all',
                Romantic: 'romantic',
                Energetic: 'energetic',
                Calm: 'calm',
                all: 'all'
            };
            
            let url = '/api/songs';
            if (mood && mood !== 'Neutral' && mood !== 'all') {
                 const mappedMood = moodMap[mood] || mood.toLowerCase();
                 url += `?mood=${mappedMood}`;
            }
            
            const response = await api.get(url);
            if (response.data.success) {
                let songs = response.data.data;
                
                // If Neutral, user wants all songs shuffled
                if (mood === 'Neutral') {
                    songs = [...songs].sort(() => Math.random() - 0.5);
                }

                setRecommendedSongs(songs);
                // Auto-set the first song and start playing after scan
                if (songs.length > 0) {
                    setCurrentSong(songs[0]);
                    setIsPlaying(true);
                } else {
                    setCurrentSong(null);
                    setIsPlaying(false);
                }
            }
        } catch (error) {
            console.error("Failed to fetch songs", error);
        }
    };

    useEffect(() => {
        fetchSongs(currentMood);
    }, [currentMood]);

    useEffect(() => {
        if (currentSong && isPlaying && audioRef.current) {
            audioRef.current.play().catch(e => console.log("Auto-play prevented", e));
        } else if (audioRef.current && !isPlaying) {
            audioRef.current.pause();
        }
    }, [currentSong, isPlaying]);

    const togglePlay = () => {
        if (!currentSong) return;
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        if (recommendedSongs.length === 0 || !currentSong) return;

        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }

        let nextIndex;
        if (isShuffle) {
            nextIndex = Math.floor(Math.random() * recommendedSongs.length);
        } else {
            const currentIndex = recommendedSongs.findIndex(s => s._id === currentSong._id);
            nextIndex = (currentIndex + 1);
            
            if (nextIndex >= recommendedSongs.length) {
                if (repeatMode === 'all') {
                    nextIndex = 0;
                } else {
                    setIsPlaying(false);
                    return;
                }
            }
        }
        
        setCurrentSong(recommendedSongs[nextIndex]);
        setIsPlaying(true);
    };

    const playPrev = () => {
        if (recommendedSongs.length === 0 || !currentSong) return;
        
        let prevIndex;
        const currentIndex = recommendedSongs.findIndex(s => s._id === currentSong._id);
        
        if (isShuffle) {
            prevIndex = Math.floor(Math.random() * recommendedSongs.length);
        } else {
            prevIndex = (currentIndex - 1 + recommendedSongs.length) % recommendedSongs.length;
        }

        setCurrentSong(recommendedSongs[prevIndex]);
        setIsPlaying(true);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const newTime = Number(e.target.value);
        setProgress(newTime);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
        }
    };

    const handleVolumeChange = (e) => {
        const newVol = Number(e.target.value);
        setVolume(newVol);
        if (audioRef.current) {
            audioRef.current.volume = newVol;
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return '0:00';
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile) return;
        
        const formData = new FormData();
        formData.append('song', uploadFile);
        formData.append('mood', uploadMood);
        
        try {
            setIsUploading(true);
            const res = await api.post('/api/songs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setShowUploadModal(false);
                setUploadFile(null);
                fetchSongs(currentMood);
            }
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!songToDelete) return;

        try {
            const res = await api.delete(`/api/songs/${songToDelete}`);
            if (res.data.success) {
                setSongToDelete(null);
                // Refresh current list
                if (activeView === 'home') fetchSongs(currentMood);
                else if (activeView === 'all-songs') fetchSongs('all');
                else fetchSongs(selectedMoodTab.charAt(0).toUpperCase() + selectedMoodTab.slice(1));
            }
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const handleUpdateMood = async (songId, newMood) => {
        try {
            const res = await api.patch(`/api/songs/${songId}/mood`, { mood: newMood });
            if (res.data.success) {
                setEditingSong(null);
                // Refresh current list
                if (activeView === 'home') fetchSongs(currentMood);
                else if (activeView === 'all-songs') fetchSongs('all');
                else fetchSongs(selectedMoodTab.charAt(0).toUpperCase() + selectedMoodTab.slice(1));
            }
        } catch (err) {
            console.error('Update failed', err);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="logo-area">
                    <h2>MoodBeats</h2>
                </div>
                
                <nav className="nav-menu">
                    <a 
                        href="#" 
                        className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveView('home'); }}
                    >
                        <span className="icon">🏠</span> Home
                    </a>
                    <a 
                        href="#" 
                        className={`nav-item ${activeView === 'all-songs' ? 'active' : ''}`}
                        onClick={(e) => { e.preventDefault(); setActiveView('all-songs'); fetchSongs('all'); }}
                    >
                        <span className="icon">🎵</span> All Songs
                    </a>
                    <div className="nav-group">
                        <span className="group-title">My Moods</span>
                        {['happy', 'sad', 'energetic', 'calm', 'romantic', 'angry'].map(m => (
                            <a 
                                key={m}
                                href="#" 
                                className={`nav-item sub-item ${activeView === 'mood-playlist' && selectedMoodTab === m ? 'active' : ''}`}
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    setActiveView('mood-playlist'); 
                                    setSelectedMoodTab(m);
                                    fetchSongs(m.charAt(0).toUpperCase() + m.slice(1)); 
                                }}
                            >
                                <span className="icon">✨</span> {m.charAt(0).toUpperCase() + m.slice(1)}
                            </a>
                        ))}
                    </div>
                </nav>

                <div className="user-section">
                    <div className="user-info">
                        <div className="avatar">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
                        <span className="username">{user?.username || 'User'}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </aside>
            
            {/* Mobile Header (Only visible on mobile via SCSS) */}
            <header className="mobile-header">
                <h1 className="logo">MoodBeats</h1>
                <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            </header>
 
            {/* Main Content */}
            <main className="main-content">
                {activeView === 'home' ? (
                    <>
                        <header className="top-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <h1>Expression Scanner</h1>
                                <p>Let AI read your mood and play the perfect track.</p>
                            </div>
                            <button 
                                onClick={() => setShowUploadModal(true)}
                                style={{background: '#1ed760', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer'}}
                            >
                                Upload Song
                            </button>
                        </header>

                        <div className="scanner-layout">
                            {/* Camera Feed Area */}
                            <FaceExpression onMoodDetected={setCurrentMood} />

                            {/* Playlist Area */}
                            <div className="playlist-section">
                                <h2>{currentMood ? `${currentMood} Mood Mix` : 'Recommended for You'}</h2>
                                <div className="song-list">
                                    {recommendedSongs.map((song) => (
                                        <div 
                                            key={song._id} 
                                            className={`song-item ${currentSong?._id === song._id ? 'active-song' : ''}`}
                                            onClick={() => {
                                                setCurrentSong(song);
                                                setIsPlaying(true);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="song-art">
                                                {song.posterUrl ? <img src={song.posterUrl} alt="art" style={{width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover'}} /> : '🎵'}
                                            </div>
                                            <div className="song-details">
                                                <h4 className="song-title">{song.title}</h4>
                                            </div>
                                            <div className="song-mood" style={{textTransform: 'capitalize', marginRight: '10px'}}>{song.mood}</div>
                                            <div style={{display: 'flex', gap: '4px'}}>
                                                <button 
                                                    className="edit-song-btn" 
                                                    onClick={(e) => { e.stopPropagation(); setEditingSong(song); }}
                                                    title="Edit Mood"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </button>
                                                <button 
                                                    className="delete-song-btn" 
                                                    onClick={(e) => { e.stopPropagation(); setSongToDelete(song._id); }}
                                                    title="Delete Song"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {recommendedSongs.length === 0 && (
                                        <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>No songs found for this mood.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeView === 'moods-grid' ? (
                    <>
                        <header className="top-header">
                            <h1>Explore Moods</h1>
                            <p>Pick a mood and let the music match your vibe.</p>
                        </header>
                        <div className="moods-selection-grid">
                            {[
                                { id: 'happy', label: 'Happy', emoji: '😊', color: '#ffcc33' },
                                { id: 'sad', label: 'Sad', emoji: '😢', color: '#3399ff' },
                                { id: 'energetic', label: 'Energetic', emoji: '🔥', color: '#ff3300' },
                                { id: 'calm', label: 'Calm', emoji: '🧘', color: '#33cc99' },
                                { id: 'romantic', label: 'Romantic', emoji: '❤️', color: '#ff3399' },
                                { id: 'angry', label: 'Angry', emoji: '💢', color: '#9933ff' }
                            ].map(mood => (
                                <div 
                                    key={mood.id}
                                    className="mood-select-card"
                                    style={{ '--mood-color': mood.color }}
                                    onClick={() => {
                                        setActiveView('mood-playlist');
                                        setSelectedMoodTab(mood.id);
                                        fetchSongs(mood.label);
                                    }}
                                >
                                    <span className="mood-emoji">{mood.emoji}</span>
                                    <h3>{mood.label}</h3>
                                    <span className="explore-text">Explore →</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <header className="top-header">
                            <h1>{activeView === 'all-songs' ? 'All My Songs' : `${selectedMoodTab.charAt(0).toUpperCase() + selectedMoodTab.slice(1)} Playlist`}</h1>
                            <p>Manage and play your personal music collection.</p>
                        </header>

                        <div className="full-playlist-view">
                            <div className="song-grid">
                                {recommendedSongs.map((song) => (
                                    <div 
                                        key={song._id} 
                                        className={`song-card ${currentSong?._id === song._id ? 'active-card' : ''}`}
                                        onClick={() => {
                                            setCurrentSong(song);
                                            setIsPlaying(true);
                                        }}
                                    >
                                        <div className="card-art">
                                            {song.posterUrl ? <img src={song.posterUrl} alt="art" /> : '🎵'}
                                            {currentSong?._id === song._id && isPlaying && <div className="playing-overlay"><span>🔊</span></div>}
                                        </div>
                                        <div className="card-info">
                                            <h4>{song.title}</h4>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <span className="mood-tag">{song.mood}</span>
                                                <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                                                    <button 
                                                        className="edit-card-btn" 
                                                        onClick={(e) => { e.stopPropagation(); setEditingSong(song); }}
                                                        title="Edit Mood"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        className="delete-card-btn" 
                                                        onClick={(e) => { e.stopPropagation(); setSongToDelete(song._id); }}
                                                        title="Delete Song"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recommendedSongs.length === 0 && (
                                    <div className="empty-state">
                                        <p>Your library is empty. Upload some songs to get started!</p>
                                        <button onClick={() => setShowUploadModal(true)}>Upload Now</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Mobile Navigation Bar */}
            <nav className="mobile-nav">
                <button 
                    className={`mobile-nav-item ${activeView === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveView('home')}
                >
                    <span className="icon">🏠</span>
                    <span>Home</span>
                </button>
                <button 
                    className={`mobile-nav-item ${activeView === 'all-songs' ? 'active' : ''}`}
                    onClick={() => { setActiveView('all-songs'); fetchSongs('all'); }}
                >
                    <span className="icon">🎵</span>
                    <span>Library</span>
                </button>
                <button 
                    className={`mobile-nav-item ${activeView === 'moods-grid' || activeView === 'mood-playlist' ? 'active' : ''}`}
                    onClick={() => setActiveView('moods-grid')}
                >
                    <span className="icon">✨</span>
                    <span>Moods</span>
                </button>
                <button className="mobile-nav-item" onClick={() => setShowUploadModal(true)}>
                    <span className="icon">➕</span>
                    <span>Upload</span>
                </button>
            </nav>

            {/* Bottom Player */}
            <div className="bottom-player">
                <div className="mini-progress-wrapper">
                    <div 
                        className="mini-progress-indicator" 
                        style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                    ></div>
                </div>
                <audio 
                    ref={audioRef} 
                    src={currentSong?.url} 
                    onEnded={playNext} 
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                />
                
                <div className="now-playing">
                    <div className="player-art">
                        {currentSong?.posterUrl ? <img src={currentSong.posterUrl} alt="art" style={{width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover'}} /> : '🎵'}
                    </div>
                    <div className="player-info">
                        <h4>{currentSong ? currentSong.title : 'No track selected'}</h4>
                        <span>{currentSong ? currentSong.mood : ''}</span>
                    </div>
                </div>

                <div className="player-controls">
                    <div className="buttons">
                        <button 
                            className={`control-btn ${isShuffle ? 'active-control' : ''}`} 
                            onClick={() => setIsShuffle(!isShuffle)}
                            title="Shuffle"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 3 21 3 21 8"></polyline>
                                <line x1="4" y1="20" x2="21" y2="3"></line>
                                <polyline points="21 16 21 21 16 21"></polyline>
                                <line x1="15" y1="15" x2="21" y2="21"></line>
                                <line x1="4" y1="4" x2="9" y2="9"></line>
                            </svg>
                        </button>
                        <button className="control-btn" onClick={playPrev}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                <line x1="5" y1="19" x2="5" y2="5"></line>
                            </svg>
                        </button>
                        <button className="play-btn" onClick={togglePlay}>
                            {isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{marginLeft: '2px'}}>
                                    <path d="M8 5v14l11-7z"></path>
                                </svg>
                            )}
                        </button>
                        <button className="control-btn" onClick={playNext}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                <line x1="19" y1="5" x2="19" y2="19"></line>
                            </svg>
                        </button>
                        <button 
                            className={`control-btn ${repeatMode !== 'none' ? 'active-control' : ''}`} 
                            onClick={() => {
                                if (repeatMode === 'none') setRepeatMode('all');
                                else if (repeatMode === 'all') setRepeatMode('one');
                                else setRepeatMode('none');
                            }}
                            title={`Repeat: ${repeatMode}`}
                        >
                            {repeatMode === 'one' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="17 1 21 5 17 9"></polyline>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <polyline points="7 23 3 19 7 15"></polyline>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                    <path d="M11 10h1v4"></path>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="17 1 21 5 17 9"></polyline>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <polyline points="7 23 3 19 7 15"></polyline>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="progress-bar">
                        <span className="time">{formatTime(progress)}</span>
                        <input 
                            type="range" 
                            min="0" 
                            max={duration || 100} 
                            value={progress} 
                            onChange={handleSeek}
                            className="slider-range"
                            style={{ '--progress': `${duration ? (progress / duration) * 100 : 0}%` }}
                        />
                        <span className="time">{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="player-volume">
                    <span>🔊</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={volume} 
                        onChange={handleVolumeChange}
                        className="slider-range"
                        style={{ '--progress': `${volume * 100}%` }}
                    />
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal">
                        <h2>Upload a Song</h2>
                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label>Select MP3 File:</label>
                                <input type="file" accept="audio/mp3,audio/*" onChange={(e) => setUploadFile(e.target.files[0])} required />
                            </div>
                            <div className="form-group">
                                <label>Assign Mood:</label>
                                <select value={uploadMood} onChange={(e) => setUploadMood(e.target.value)}>
                                    <option value="happy">Happy</option>
                                    <option value="sad">Sad</option>
                                    <option value="energetic">Energetic</option>
                                    <option value="calm">Calm</option>
                                    <option value="romantic">Romantic</option>
                                    <option value="angry">Angry</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                <button type="submit" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Upload'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Mood Modal */}
            {editingSong && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal">
                        <h2>Edit Song Mood</h2>
                        <p style={{color: '#a1a1aa', marginBottom: '24px'}}>Change the mood for <strong>{editingSong.title}</strong></p>
                        <div className="form-group">
                            <label>Select New Mood:</label>
                            <select 
                                defaultValue={editingSong.mood} 
                                onChange={(e) => handleUpdateMood(editingSong._id, e.target.value)}
                            >
                                <option value="happy">Happy</option>
                                <option value="sad">Sad</option>
                                <option value="energetic">Energetic</option>
                                <option value="calm">Calm</option>
                                <option value="romantic">Romantic</option>
                                <option value="angry">Angry</option>
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={() => setEditingSong(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {songToDelete && (
                <div className="upload-modal-overlay">
                    <div className="upload-modal delete-modal">
                        <div className="delete-icon-wrapper">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4b4b" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                            </svg>
                        </div>
                        <h2>Delete Song?</h2>
                        <p>This action cannot be undone. The song will be permanently removed from your library.</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setSongToDelete(null)}>Keep Song</button>
                            <button className="confirm-delete-btn" onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
