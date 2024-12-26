// 获取音频和歌词容器
const audio = document.getElementById('audio');
const lyricsContainer = document.getElementById('lyrics');
const countdownContainer = document.getElementById('countdown');
const toggleModeButton = document.getElementById('toggleMode');

// 定义歌词数据
let lyrics = [];

// 加载 LRC 文件
fetch('lyrics.lrc')
    .then(response => response.text())
    .then(data => {
        lyrics = parseLyrics(data);
        displayLyrics(lyrics);
    })
    .catch(err => console.error('无法加载歌词文件:', err));

// 解析 LRC 歌词
function parseLyrics(lrc) {
    const lines = lrc.split('\n');
    return lines.map(line => {
        const match = line.match(/\[(\d{2}):(\d{2}\.\d{3})\](.*)/); // 解析时间戳
        if (match && match[3].trim()) {
            const minute = parseInt(match[1], 10);
            const second = parseFloat(match[2]);
            const text = match[3].trim();

            // 假设英文歌词和中文翻译按行配对
            const [englishText, chineseText] = text.split(' // '); // 分割英文和中文部分
            return {
                time: minute * 60 + second,
                english: englishText || '',
                chinese: chineseText || ''
            };
        }
        return null;
    }).filter(item => item !== null);
}

// 显示歌词
function displayLyrics(lyrics) {
    lyricsContainer.innerHTML = lyrics
        .map(item => `
            <p class="lyric-line">
                <span class="english">${item.english}</span><br>
                <span class="chinese">${item.chinese}</span>
            </p>
        `)
        .join('');
}

// 更新当前歌词
function updateLyrics() {
    const currentTime = audio.currentTime;
    let activeLyricIndex = -1;

    for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
            activeLyricIndex = i;
        } else {
            break;
        }
    }

    if (activeLyricIndex !== -1) {
        const lyricLines = lyricsContainer.querySelectorAll('.lyric-line');
        lyricLines.forEach((line, index) => {
            if (index === activeLyricIndex) {
                line.classList.add('active');
                line.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                line.classList.remove('active');
            }
        });
    }
}

// 在音频播放时更新歌词
audio.addEventListener('timeupdate', updateLyrics);

// 计算下一个至日的倒计时
function getNextSolstice() {
    const now = new Date();
    const year = now.getFullYear();
    const winterSolstice = new Date(`December 21, ${year} 00:00:00`);
    const summerSolstice = new Date(`June 21, ${year} 00:00:00`);
    return now < summerSolstice ? summerSolstice : winterSolstice;
}

function updateCountdown() {
    const nextSolstice = getNextSolstice();
    const now = new Date();
    const diff = nextSolstice - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    countdownContainer.textContent = `Next solstice in ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);

// 切换模式
function toggleMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode', !isDarkMode);
    toggleModeButton.setAttribute('aria-pressed', isDarkMode);
    localStorage.setItem('mode', isDarkMode ? 'dark' : 'light');
}

toggleModeButton.addEventListener('click', toggleMode);

// 加载用户偏好
const savedMode = localStorage.getItem('mode');
if (savedMode) {
    document.body.classList.add(savedMode === 'dark' ? 'dark-mode' : 'light-mode');
    toggleModeButton.setAttribute('aria-pressed', savedMode === 'dark');
} else {
    document.body.classList.add('light-mode');
}