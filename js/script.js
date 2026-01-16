let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeating = false;

// ============================================
// DOM ELEMENT SELECTORS
// ============================================

// Playbar Controls - Saare buttons select karo
const playPauseBtn = document.querySelector(".play-pause-btn");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");
const shuffleBtn = document.querySelector(".shuffle-btn");
const repeatBtn = document.querySelector(".repeat-btn");

// Playbar Info - Song ki info dikhane ke liye
const songImage = document.querySelector(".song-image");
const songTitle = document.querySelector(".song-title");
const songArtist = document.querySelector(".song-artist");

// Progress Bar - Time aur progress ke liye
const progressBar = document.querySelector(".progress-bar");
const currentTimeEl = document.querySelector(".current-time");
const totalTimeEl = document.querySelector(".total-time");

// Volume Controls
const volumeSlider = document.querySelector(".volume-slider");
const volumeIcon = document.querySelector(".volume-icon");

//loading spinner
const loadingOverlay = document.querySelector(".loading-overlay");

//toast Notification
const toast = document.querySelector(".toast");
const toastTitle = document.querySelector(".toast-title");
const toastMessage = document.querySelector(".toast-message");

//playlist elements

const createPlaylistBtn = document.querySelector(".create-playlist-btn");
const playlistModal = document.querySelector(".playlist-modal");
const closeModalBtn = document.querySelector(".close-modal");
const modalOverlay = document.querySelector(".modal-overlay");
const btnCancel = document.querySelector(".btn-cancel");
const btnCreate = document.querySelector(".btn-create");
const playlistsContainer = document.querySelector(".playlists-container");
const emptyLibrary = document.querySelector(".empty-library");
const playlistNameInput = document.querySelector(".playlist-name-input");

// Audio Object - Ye actual audio play karega
const audio = new Audio();

// =====================
// playlist data storage
// =====================
let playlists = [];

function loadPlaylists() {
  const saved = localStorage.getItem("spotifyPlaylists");

  if (saved) {
    playlists = JSON.parse(saved);
  }
}

function savePlaylists() {
  localStorage.setItem("spotifyPlaylists", JSON.stringify(playlists));
}

// =====================================
//       Playlist Modal Function
// =====================================

function openPlaylistModal() {
  playlistModal.classList.remove("hidden");
  playlistNameInput.value = "";
  playlistNameInput.focus();
}

function closePlaylistModal() {
  playlistModal.classList.add("hidden");
  playlistModal.value = "";
}

function createPlaylist() {
  const name = playlistNameInput.value.trim();

  if (!name) {
    showToast("Error", "Please enter playlist name", "error");
    return;
  }

  const playlist = {
    id: Date.now(),
    name: name,
    songs: [],
    createdAt: Date.now(),
  };

  playlist.push(playlist);
  savePlaylists();
  closePlaylistModal();
  showToast("success","Playlist created!","success");
  renderPlaylists();

  if (playlist.length>0){
    emptyLibrary.classList.add("hidden");
  }
}

// ============================================
// FETCH & RENDER FUNCTIONS
// ============================================

async function fetchSongs() {
  try {
    showLoading();
    const response = await fetch("/data/songs.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    songs = await response.json();
    console.log(`🎵 Loaded ${songs.length} songs`);

    renderSongCards();
    loadSong(0);
    hideLoading();

    showToast(
      "Library Loaded",
      `${songs.length} songs ready to play`,
      "success"
    );
  } catch (error) {
    console.log("Error Loading Songs.", error);
    hideLoading();

    showToast(
      "Load Failed",
      "Could not load songs. Check Your Connection...",
      "error"
    );
  }
}

function renderSongCards() {
  songs.forEach((song, index) => {
    const existingCard = document.querySelector(`[data-song-index="${index}"]`);
    if (existingCard) return;

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-song-index", index);

    card.innerHTML = `
  <div class="image-container">
    <img class="songImg" src="${song.image}" alt="${song.name}" onerror="this.src='assets/images/cover.jpg'">
    <div class="play-button">
      <img src="assets/icons/play.svg" alt="play button icon">
    </div>
  </div>
  <h2 class="titleText">${song.name}</h2>
  <p class="songText">${song.artist}</p>
`;

    card.addEventListener("click", () => {
      loadSong(index);
      playSong();
    });
  });
}

// ============================================
// SONG LOADING & HIGHLIGHTING
// ============================================

function loadSong(songIndex) {
  if (songs.length === 0) return;

  const song = songs[songIndex];

  audio.src = song.audio;
  songImage.src = song.image;
  songTitle.textContent = song.name;
  songArtist.textContent = song.artist;

  currentSongIndex = songIndex;

  highlightCurrentCard();
}

function highlightCurrentCard() {
  document.querySelectorAll(".card").forEach((card) => {
    card.classList.remove("playing");
  });

  const currentCard = document.querySelector(
    `[data-song-index="${currentSongIndex}"]`
  );
  if (currentCard) {
    currentCard.classList.add("playing");
  }
}

// ============================================
// PLAY/PAUSE CONTROLS
// ============================================

function playSong() {
  showLoading();

  audio
    .play()
    .then(() => {
      isPlaying = true;
      playPauseBtn.querySelector("img").src = "assets/icons/pause.svg";
      hideLoading(); // ✅ Hide after successful play

      showToast(
        "Now Playing",
        `${songTitle.textContent}-${songArtist.textContent}`,
        "success"
      );
    })
    .catch((error) => {
      console.error("Playback error:", error);
      hideLoading(); // ✅ Hide on error too

      showToast(
        "Playback Error",
        "Failed to play song. Please try again...",
        "error"
      );
    });
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.querySelector("img").src = "assets/icons/play.svg";
}

function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

// ============================================
// NEXT/PREVIOUS SONG NAVIGATION
// ============================================

function nextSong() {
  if (isShuffled) {
    currentSongIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentSongIndex++;
    if (currentSongIndex >= songs.length) {
      currentSongIndex = 0;
    }
  }
  loadSong(currentSongIndex);
  playSong();
}

function prevSong() {
  currentSongIndex--;
  if (currentSongIndex < 0) {
    currentSongIndex = songs.length - 1;
  }

  loadSong(currentSongIndex);
  playSong();
}

// ============================================
// PROGRESS BAR & TIME FUNCTIONS
// ============================================

function updateProgress() {
  if (audio.duration) {
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;
    const currentMinutes = Math.floor(audio.currentTime / 60);
    const currentSeconds = Math.floor(audio.currentTime % 60);
    currentTimeEl.textContent = `${currentMinutes}:${currentSeconds
      .toString()
      .padStart(2, "0")}`;
  }
}

function setProgress() {
  const seekTime = (progressBar.value / 100) * audio.duration;
  audio.currentTime = seekTime;
}

function setTotalTime() {
  if (audio.duration) {
    const totalMinutes = Math.floor(audio.duration / 60);
    const totalSeconds = Math.floor(audio.duration % 60);
    totalTimeEl.textContent = `${totalMinutes}:${totalSeconds
      .toString()
      .padStart(2, "0")}`;
  }
}

// ============================================
// VOLUME CONTROLS
// ============================================

function setVolume() {
  audio.volume = volumeSlider.value / 100;

  if (volumeSlider.value == 0) {
    volumeIcon.src = "assets/icons/mute.svg";
  } else {
    volumeIcon.src = "assets/icons/volume.svg";
  }
}

// ============================================
// SHUFFLE & REPEAT TOGGLES
// ============================================

function toggleShuffle() {
  isShuffled = !isShuffled;

  if (isShuffled) {
    shuffleBtn.style.opacity = "1";
    shuffleBtn.style.filter =
      "invert(1) sepia(1) saturate(5) hue-rotate(80deg)";
  } else {
    shuffleBtn.style.opacity = "0.7";
    shuffleBtn.style.filter = "invert(1)";
  }
}

function toggleRepeat() {
  isRepeating = !isRepeating;

  if (isRepeating) {
    repeatBtn.style.opacity = "1";
    repeatBtn.style.filter = "invert(1) sepia(1) saturate(5) hue-rotate(80deg)";
  } else {
    repeatBtn.style.opacity = "0.7";
    repeatBtn.style.filter = "invert(1)";
  }
}

// ============================================
// SONG END HANDLER
// ============================================

function handleSongEnd() {
  if (isRepeating) {
    audio.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

playPauseBtn.addEventListener("click", togglePlayPause);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
shuffleBtn.addEventListener("click", toggleShuffle);
repeatBtn.addEventListener("click", toggleRepeat);
progressBar.addEventListener("input", setProgress);
volumeSlider.addEventListener("input", setVolume);
audio.addEventListener("loadstart", showLoading);
audio.addEventListener("canplay", hideLoading);
audio.addEventListener("waiting", showLoading);
audio.addEventListener("playing", hideLoading);

volumeIcon.addEventListener("click", () => {
  if (volumeSlider.value > 0) {
    volumeSlider.dataset.prevVolume = volumeSlider.value;
    volumeSlider.value = 0;
  } else {
    volumeSlider.value = volumeSlider.dataset.prevVolume || 50;
  }
  setVolume();
});

audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("loadmetadata", setTotalTime);
audio.addEventListener("ended", handleSongEnd);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlayPause();
      break;
    case "ArrowRight":
      nextSong();
      break;

    case "ArrowLeft":
      prevSong();
      break;

    case "ArrowUp":
      e.preventDefault();
      volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
      setVolume();
      break;

    case "ArrowDown":
      e.preventDefault();
      volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
      setVolume();
      break;

    case "KeyM":
      volumeIcon.click();
      break;

    case "KeyS":
      toggleShuffle();
      break;

    case "KeyR":
      toggleRepeat();
      break;
  }
});

function attachCardListeners() {
  const existingCard = document.querySelectorAll(".card");
  existingCard.forEach((card, index) => {
    card.setAttribute("data-song-index", index);
    card.addEventListener("click", () => {
      if (index < songs.length) {
        loadSong(index);
        playSong();
      }
    });
  });
}

const cardContainer = document.querySelector(".cardContainer");

function renderSongCards() {
  songs.forEach((song, index) => {
    const existingCard = document.querySelector(`[data-song-index="${index}"]`);
    if (existingCard) return;

    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-song-index", index);

    card.innerHTML = `
      <div class="image-container">
        <img class="songImg" src="${song.image}" alt="${song.name}" onerror="this.src='assets/images/cover.jpg'">
        <div class="play-button">
          <img src="assets/icons/play.svg" alt="play button icon">
        </div>
      </div>
      <h2 class="titleText">${song.name}</h2>
      <p class="songText">${song.artist}</p>
    `;

    card.addEventListener("click", () => {
      loadSong(index);
      playSong();
    });

    cardContainer.appendChild(card);
  });
}

// ============================================
// LOADING STATES
// ============================================

function showLoading() {
  loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  loadingOverlay.classList.add("hidden");
}

function showToast(title, message, type = "success") {
  //set Content
  toastTitle.textContent = title;
  toastMessage.textContent = message;

  toast.classList.remove("sucess", "error");
  toast.classList.add(type);

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  attachCardListeners();
  fetchSongs();

  audio.volume = volumeSlider.value / 100;

  console.log("Spotify Clone Ready! 🎵");
});
