  // 音乐播放状态
  let state = 0;
  // 控制音乐播放
  let isPlay = false;
   // 播放音乐
   function playMusci() {
      $("#audio")[0].play()
      isPlay = true;
      $("#music_icon").addClass('icon-ani')
      $("#music_icon").removeClass('icon-ani-pause')
      state = 2;
  }
  // 暂停音乐
  function pauseMusic() {
      $("#audio")[0].pause()
      isPlay = false;
      $("#music_icon").addClass('icon-ani-pause')
  }
  // 点击右上角图标控制音乐播放或者暂停
  $("#music_icon").click(function () {
      if (!isPlay) {
          playMusci()
      } else {
          pauseMusic()
      }
  })