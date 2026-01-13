let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let isShuffled = false;
let isRepeating = false;

const playPauseBtn = document.querySelector(".play-pause-btn");
const progressBar = document.querySelector("progress-bar");
const volumeSlider = document.querySelector("volume-slider");

const audio = new Audio();

async function fetchSongs() {
    try {
        const response = await fetch(songs.js);
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
        const existingCard = document.querySelector('[data-song-index="${index}"]');
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

        card.addEventListener('click',() => {
            loadSong(index);
            playSong();
        });
    });
}
