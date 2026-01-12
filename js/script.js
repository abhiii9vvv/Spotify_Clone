let songs[];
let currentSongIndex=0;
let isPlaying=false;
let isShuffled=false;
let isRepeating=false;

const playPauseBtn=document.querySelector('.play-pause-btn');
const progressBar=document.querySelector('progress-bar');
const volumeSlider=document.querySelector('volume-slider')

const audio= new Audio();