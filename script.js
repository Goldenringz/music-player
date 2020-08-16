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

// set up audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// create analyser node and connect to audio source
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audioEl);
source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 2048 * 2 * 2;
const freqArray = new Uint8Array(analyser.frequencyBinCount);

let requestAnimationId = null;
let canvasContext = null;

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
		name: 'power-1',
		displayName: 'Power',
		artist: 'AShamaluevMusic',
	},
	{
		name: 'metric-1',
		displayName: 'Front Row (Remix)',
		artist: 'Metric/Jacinto Design',
	},
	{
		name: 'luxurious-1',
		displayName: 'Luxurious',
		artist: 'AShamaluevMusic',
	},
];

let isPlaying = false;
let currAudioIdx = 0;

// animation configs
const radius = 150;
const bars = 300;
const barWidth = 2;

// draw one waveform bar
// x1, y1 - coords where bar starts
// x2, y2 - coords where bar ends
function drawBar(x1, y1, x2, y2, width, frequency) {
	canvasContext.strokeStyle = 'hsla(200, 100%, 30%, 0.5)';
	canvasContext.lineWidth = width;
	canvasContext.beginPath();
	canvasContext.moveTo(x1, y1);
	canvasContext.lineTo(x2, y2);
	canvasContext.stroke();
}

function startAudioWaveformAnimation() {
	const canvas = document.getElementById('audiowave');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	canvasContext = canvas.getContext('2d');

	analyser.getByteFrequencyData(freqArray);

	for (let i = 0; i < bars; i++) {
		//divide a circle into equal parts
		const rads = (Math.PI * 2) / bars;
		let barHeightCoeff = 2.5;
		if (window.innerWidth < 400) {
			barHeightCoeff = 1;
		}
		const barHeight = freqArray[i] * barHeightCoeff;

		// set coordinates
		const x = centerX + Math.cos(rads * i) * radius;
		const y = centerY + Math.sin(rads * i) * radius;
		const xEnd = centerX + Math.cos(rads * i) * (radius + barHeight);
		const yEnd = centerY + Math.sin(rads * i) * (radius + barHeight);

		drawBar(x, y, xEnd, yEnd, barWidth, freqArray[i]);
	}
	requestAnimationId = window.requestAnimationFrame(
		startAudioWaveformAnimation
	);
}

// play
function playAudio() {
	isPlaying = true;
	playBtn.classList.replace('fa-play', 'fa-pause');
	playBtn.setAttribute('title', 'Pause');
	startAudioWaveformAnimation();
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

function isMobile() {
	const toMatch = [
		/Android/i,
		/webOS/i,
		/iPhone/i,
		/iPad/i,
		/iPod/i,
		/BlackBerry/i,
		/Windows Phone/i,
	];

	return toMatch.some((toMatchItem) => {
		return navigator.userAgent.match(toMatchItem);
	});
}

// play or pause event listener
if (isMobile()) {
	// click listener for mobile
	playBtn.addEventListener('touchend', () =>
		isPlaying ? pauseAudio() : playAudio()
	);
} else {
	playBtn.addEventListener('click', () =>
		isPlaying ? pauseAudio() : playAudio()
	);
}

// player controls event listeners
if (isMobile()) {
	// click listener for mobile
	nextBtn.addEventListener('touchend', nextAudioHandler);
	prevBtn.addEventListener('touchend', prevAudioHandler);
} else {
	nextBtn.addEventListener('click', nextAudioHandler);
	prevBtn.addEventListener('click', prevAudioHandler);
}

// progress bar event listener
audioEl.addEventListener('timeupdate', updateProgressBar);
audioEl.addEventListener('ended', nextAudioHandler);

if (isMobile()) {
	progressContainer.addEventListener('touchend', setProgressBar);
} else {
	progressContainer.addEventListener('click', setProgressBar);
}

// on load - select first song
loadAudio(audios[currAudioIdx]);

document.body.onkeyup = function (e) {
	if (e.keyCode == 32) {
		if (isPlaying) {
			pauseAudio();
		} else {
			playAudio();
		}
	}
};
