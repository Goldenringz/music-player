const imageForAudio = document.getElementById('image');
const title = document.getElementById('title');
const artist = document.getElementById('artist');

const audioEl = document.getElementById('audio');

const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
const currentAudioTime = document.getElementById('current-time');
const durationAudio = document.getElementById('duration');

const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');

// music
const audios = [
	{
		name: 'jacinto-1',
		displayName: 'Electic Chill Machine',
		artist: 'Jacinto Design',
	},
	{
		name: 'jacinto-2',
		displayName: 'Seven Nation Army (Remix)',
		artist: 'Jacinto Design',
	},
	{
		name: 'jacinto-3',
		displayName: 'Goodnight, Disco Queen',
		artist: 'Jacinto Design',
	},
	{
		name: 'metric-1',
		displayName: 'Front Row (Remix)',
		artist: 'Metric/Jacinto Design',
	},
];

let isPlaying = false;
let currAudioIdx = 0;

// play
function playAudio() {
	isPlaying = true;
	playBtn.classList.replace('fa-play', 'fa-pause');
	playBtn.setAttribute('title', 'Pause');
	audioEl.play();
}

// pause
function pauseAudio() {
	isPlaying = false;
	playBtn.classList.replace('fa-pause', 'fa-play');
	playBtn.setAttribute('title', 'Play');
	audioEl.pause();
}

function loadAudio(audio) {
	title.textContent = audio.displayName;
	artist.textContent = audio.artist;
	audioEl.src = `music/${audio.name}.mp3`;
	imageForAudio.src = `img/${audio.name}.jpg`;
}

function loadAndPlayCurrAudio() {
	loadAudio(audios[currAudioIdx]);
	playAudio();
}

// next audio handler
function nextAudioHandler() {
	// modulus of number of audios to play audio tracks in circle
	currAudioIdx = (currAudioIdx + 1) % audios.length;
	loadAndPlayCurrAudio();
}

// prev audio handler
function prevAudioHandler() {
	// modulus of number of audios to play audio tracks in circle
	// js modulo returns negative result for negative number
	// to fix this: (i % n + n) % n
	// https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
	const nextAudioIdx = currAudioIdx - 1;
	const total = audios.length;
	currAudioIdx = ((nextAudioIdx % total) + total) % total;
	loadAndPlayCurrAudio();
}

// calc time to display in player and return formatted string
function getTimeStr(time) {
	let timeMins = Math.floor(time / 60);
	let timeSecs = Math.floor(time % 60);
	timeMins = timeMins < 10 ? `0${timeMins}` : timeMins;
	timeSecs = timeSecs < 10 ? `0${timeSecs}` : timeSecs;

	// delay changing time for element content to avoid NaN
	// because it has not time while loading from server
	return timeSecs ? `${timeMins}:${timeSecs}` : '';
}

// update progress bar & cur audio time
function updateProgressBar(e) {
	if (isPlaying) {
		const { duration, currentTime } = e.srcElement;
		// update progress bar width
		const progressPercent = (currentTime / duration) * 100;
		progressBar.style.width = `${progressPercent}%`;

		const durationStr = getTimeStr(duration);
		durationAudio.textContent = durationStr;

		const currTimeStr = getTimeStr(currentTime);
		currentAudioTime.textContent = currTimeStr;
	}
}

// set audio progress bar to jump over trak duration
function setProgressBar(e) {
	const width = this.clientWidth;
	const clickXPos = e.offsetX;
	const { duration } = audioEl;

	const progressPercentToSet = (clickXPos / width) * duration;
	audioEl.currentTime = progressPercentToSet;
	if (!isPlaying) {
		playAudio();
	}
}

// play or pause event listener
playBtn.addEventListener('click', () =>
	isPlaying ? pauseAudio() : playAudio()
);

// player controls event listeners
nextBtn.addEventListener('click', nextAudioHandler);
prevBtn.addEventListener('click', prevAudioHandler);

// progress bar event listener
audioEl.addEventListener('timeupdate', updateProgressBar);
audioEl.addEventListener('ended', nextAudioHandler);
progressContainer.addEventListener('click', setProgressBar);

// on load - select first song
loadAudio(audios[currAudioIdx]);
