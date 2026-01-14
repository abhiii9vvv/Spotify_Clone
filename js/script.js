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

const audio = new Audio();

async function fetchSongs() {
  try {
    const response = await fetch('/data/songs.json');
    songs = await response.json();
    console.log(`🎵 Loaded ${songs.length} songs`);

    renderSongCards();
    loadSong(0);
  } catch (error) {
    console.log("Error Loading Songs.", error);
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

function playSong() {
  audio.play();
  isPlaying = true;
  playPauseBtn.querySelector('img').src = "assets/icons/pause.svg";
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.querySelector('img').src = "assets/icons/play.svg";
}

function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

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

function setVolume() {
  audio.volume = volumeSlider.value / 100;

  if (volumeSlider.value == 0) {
    volumeIcon.src = "assets/icons/mute.svg";
  } else {
    volumeIcon.src = "assets/icons/volume.svg";
  }
}

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
    repeatBtn.style.filter =
      "invert(1) sepia(1) saturate(5) hue-rotate(80deg)";
  } else {
    repeatBtn.style.opacity= '0.7';
    repeatBtn.style.filter = 'invert(1)';
  }
}

function handleSongEnd() {
    if (isRepeating) {
        audio.currentTime = 0;
        playSong();
    } else{
        nextSong();
    }
}

playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click',nextSong);
prevBtn.addEventListener('click',prevSong);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click',toggleRepeat);
progressBar.addEventListener('click',setProgress);
volumeSlider.addEventListener('click',setVolume);

volumeIcon.addEventListener('click',() => {
    if (volumeSlider.value > 0) {
        volumeSlider.dataset.prevVolume =  volumeSlider.value;
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = volumeSlider.dataset.prevVolume || 50;
    }
    setVolume();
});

audio.addEventListener('timeupdate',updateProgress);
audio.addEventListener('loadmetadata',setTotalTime);
audio.addEventListener('ended',handleSongEnd);

document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
    }
})

document.addEventListener('DOMContentLoaded',() => {
    fetchSongs();

    audio.volume = volumeSlider.value / 100;

    // attachCardListeners();

    console.log("All Set")
})