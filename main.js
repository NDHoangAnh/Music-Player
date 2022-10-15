const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8-PLAYER';
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const player = $('.player');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');
const app = {
    currentIndex : 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name : '3107',
            singer : 'Duong',
            path : './music/3107-3-1-2-W-n-x-Nau-x-Duongg-x-Titie-Lofi-Version-by-Vu-Ngan-My-Buoc-Nhay-Official-Vu-Ngan-My.mp3',
            image : './img/3107.jpg'
        },
        {
            name : 'Anh sai rồi',
            singer : 'MTP',
            path : './music/AnhSaiRoi-MTP-2647024.mp3',
            image : './img/mtp.jpg'
        },
        {
            name : 'Muộn rồi mà sao còn',
            singer : 'MTP',
            path : './music/MuonRoiMaSaoCon-SonTungMTP-7011803.mp3',
            image : './img/mtp.jpg'
        },
        {
            name : 'Suýt nữa thì',
            singer : 'Andiez',
            path : './music/Suyt-Nua-Thi-Chuyen-Di-Cua-Thanh-Xuan-OST-Andiez.mp3',
            image : './img/andiez.jpg'
        },
        {
            name : 'Tháng mấy em nhớ anh',
            singer : 'Ha Anh Tuan',
            path : './music/ThangMayEmNhoAnh-HaAnhTuan-6995531.mp3',
            image : './img/ha_anh_tuan.jpg'
        },
        {
            name : 'Yêu 5',
            singer : 'Rhymatic',
            path : './music/Yeu-5-Rhymastic.mp3',
            image : './img/rhymastic.jpg'
        }
    ],
    setConfig : function (key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render : function(){
        const htmls = this.songs.map((song,index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('');
    },
    defineProperties : function() {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
        // định nghĩa thuộc tính mới currentSong cho object
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents : function () {
        const cdWidth = cd.offsetWidth;
        const _this = this; // _this = chương trình app

        // xử lí cd quay/ dừng
        const cdThumbAnimate = cdThumb.animate ([
            {transform: 'rotate(360deg)'}
        ], {
            duration : 10000, // 10 seconds
            iterations : Infinity
        });
        cdThumbAnimate.pause(); // mặc định khi start app sẽ dừng

        document.onscroll = function () {
            const scrollTop = window.scrollY;
            const newCdWidth = cdWidth - scrollTop;
            //thu nhỏ cd khi kéo
            cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth; // để cd mở dần
        };

        // xử lí khi ấn nút play
        playBtn.onclick = function () {
            if(_this.isPlaying){ 
                audio.pause();
            } else {audio.play();}
        }
        // khi bài hát được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play(); // cd quay
        };
        // khi bài hát được dừng lại
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause(); // cd dừng
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function (){
            // duration là độ dài của bài hát  
            if(audio.duration) // khi duration khác NaN (tức là được chạy)
            {
                const progressPercent = Math.floor(audio.currentTime/ audio.duration * 100);
                progress.value = progressPercent;
            }
        }
        // xử lí khi tua
        progress.oninput = function (e) {
            const seekTime = audio.duration/100 * e.target.value;
            audio.currentTime = seekTime;
        }
        
        // khi next bài hát
        nextBtn.onclick = function () {
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // khi prev bài hát
        prevBtn.onclick = function (){
            if(_this.isRandom)
            {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // khi ấn nút random 
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom;  // bật/ tắt chức năng random
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // xử lí next song khi audio end
        audio.onended = function () {
            if(_this.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // xử lí phát lại bài hát
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option') ){
                // xử lí khi click vào song
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
                // xử lí khi click vào song option
                if(e.target.classList('.option')) {

                }
            }
        }


    },
    scrollToActiveSong: function() {
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior : 'smooth',
                block : 'nearest'
            })
        }, 300);
    },
    loadCurrentSong : function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

    },
    loadConfig : function (){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong : function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong : function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
    },
    // randomSong : function (){
    //     this.currentIndex = Math.floor(Math.random()*this.songs.length) +1;
    //     this.loadCurrentSong();
    // },
    playRandomSong : function(){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex );
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start : function() {
        // gán cấu hình từ config vào object ứng dụng
        this.loadConfig();

        // định nghĩa thuộc tính cho object 
        this.defineProperties();

        // lắng nghe / xử lí sự kiện
        this.handleEvents();

        // tải thông tin bài hát đầu tiên khi chạy ứng dụng
        this.loadCurrentSong();
        
        // render playlist
        this.render();

        // lưu cấu hình repeat/random
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
        
    }
};
app.start();