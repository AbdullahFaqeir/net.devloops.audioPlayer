var WNAME = 'net.devloops.audioPlayer';

/**
 * Audio Player Object
 */
const AudioPlayer = Ti.Media.createAudioPlayer({
  url: '',
  allowBackground: true,
  audioFocus: true
});

const ScreenWidth = Ti.Platform.displayCaps.platformWidth / Ti.Platform.displayCaps.logicalDensityFactor;
console.log('ScreenWidth', ScreenWidth);

var NewCoverSize = ScreenWidth * 0.8;

$.AudioPlayerCoverBox.width = NewCoverSize;
$.AudioPlayerCoverBox.height = $.AudioPlayerCover.height;
$.AudioPlayerCover.width = NewCoverSize;

/**
 * iOS Remote Control to update Control Center Player Widget
 */
if (OS_IOS) {
  var iOSRemoteControl = null;
  try {
    iOSRemoteControl = require('net.hoyohoyo.tiremotecontrol');
  } catch (e) {
    console.log(e);
  }
}

if (iOSRemoteControl) {
  iOSRemoteControl.addEventListener('remotecontrol', function(e) {
    Ti.API.debug('remote control event was fired!');
    switch (e.subtype) {
      case iOSRemoteControl.REMOTE_CONTROL_PLAY:
      case iOSRemoteControl.REMOTE_CONTROL_PAUSE:
      case iOSRemoteControl.REMOTE_CONTROL_PLAY_PAUSE:
        if (PlayerStatus === 1) {
          pause();
        } else {
          play();
        }
        break;
      case iOSRemoteControl.REMOTE_CONTROL_STOP:
        stop();
        break;
      case iOSRemoteControl.REMOTE_CONTROL_PREV:
        playPrev(e);
        break;
      case iOSRemoteControl.REMOTE_CONTROL_NEXT:
        playNext(e);
        break;
    }
  });
}

/**
 * Playlist array of objects {url:'',title:'',album:''}
 */
var Playlist = [];

/**
 * The index of the current playing item from the playlist
 */
var CurrentPlayingItem = -1;

/**
 * To Allow Player to keep on playing in background
 * Needed for iOS
 * @link {https://stackoverflow.com/a/38861973}
 */
if (OS_IOS) {
  Ti.Media.audioSessionCategory = Ti.Media.AUDIO_SESSION_CATEGORY_PLAYBACK;
}

/**
 * Player Volume Controller
 */
const VolumeSlider = $.PlayerVolumeSlider;

/**
 * Player Play/Pause Controller
 */
const PlayPauseBtn = $.PlayPauseBtn;

/**
 * Player Backward Controller
 */
const BackwardBtn = $.BackwardBtn;

/**
 * Player Forward Controller
 */
const ForwardBtn = $.ForwardBtn;

/**
 * Player Timers
 */
const SeekerCricle = $.SeekerCricle;
const SeekerLine = $.SeekerLine;
const TimeElapsed = $.TimeElapsed;
const TimeLeft = $.TimeLeft;
TimeElapsed.text = '00:00';
TimeLeft.text = '-00:00';

/**
 * Player Titles
 */
const TrackTitle = $.TrackTitle;
const TrackAuthorAlbum = $.TrackAuthorAlbum;
TrackTitle.text = '---';
TrackAuthorAlbum.text = '-----';

/**
 * Handle Seekr Circle Touch Start to expand it
 */
SeekerCricle.addEventListener('touchstart', function() {
  SeekerCricle.width = 20;
  SeekerCricle.height = 20;
  SeekerCricle.borderRadius = 20;
});

/**
 * Handle Seeker Circle Touch End to reduce it size back and seek playet to desired time
 */
SeekerCricle.addEventListener('touchend', function(e) {
  SeekerCricle.width = 10;
  SeekerCricle.height = 10;
  SeekerCricle.borderRadius = 10;

  var points = e.source.convertPointToView({
    x: e.x - (SeekerCricle.width),
    y: e.y
  }, $.SeekerContainer);

  var shouldGoOut = (Ti.Platform.displayCaps.platformWidth * 0.8) - ($.SeekerContainer.rect.x / 2);

  var ChangePrecentage = points.x / shouldGoOut * 100;
  // AudioPlayer.duration -
  var seekToTime = (AudioPlayer.duration * ChangePrecentage / 100);

  //console.log('ChangePrecentage', ChangePrecentage);
  //console.log('AudioPlayer.duration', AudioPlayer.duration);
  //console.log('seekToTime', seekToTime);

  if (OS_ANDROID) {
    AudioPlayer.time = seekToTime;
  } else {
    AudioPlayer.seekToTime(seekToTime);
  }

});

/**
 * Handle Seeker Circle Move event to animate it's slide
 */
SeekerCricle.addEventListener('touchmove', function(e) {
  var points = e.source.convertPointToView({
    x: e.x - (SeekerCricle.width),
    y: e.y
  }, $.SeekerContainer);

  var shouldGoOut = (Ti.Platform.displayCaps.platformWidth * 0.8) - ($.SeekerContainer.rect.x / 2);

  //console.log('SeekerCricle x = ' + points.x);
  //console.log('shouldGoOut x = ' + shouldGoOut);
  if (points.x <= shouldGoOut && points.x >= 0) {
    SeekerCricle.left = points.x;
    SeekerLine.width = points.x;
  }
});

/**
 * 1 = Playing
 * 2 = Paused
 */
var PlayerStatus = 0;

/**
 * Update Volume Slider with the current volume
 */
//VolumeSlider.value = Ti.Media.volume;

/**
* Update Volume

 */
VolumeSlider.addEventListener('change', function(event) {
  const value = event.value;
  //console.log('VolumeSlider Change = ', value);
  AudioPlayer.volume = value;
  Ti.App.fireEvent(WNAME + '.volumechange', event);
});

/**
 * Handle Backward single click (Restart)
 */
BackwardBtn.addEventListener('click', restartAudio);

/**
 * Handle Backward double click (Play Prev)
 */
BackwardBtn.addEventListener('doubletap', playPrev);

/**
 * Handle Forward click
 */
ForwardBtn.addEventListener('click', playNext);

/**
 * Update Player Volume Slider if the user changed the volume
 */
Ti.Media.addEventListener('volume', function(event) {
  //console.log('Phone Volume Updated to = ', event.volume);
  VolumeSlider.value = event.volume;
});

/**
 * Handle Play/Pause Button
 */
PlayPauseBtn.addEventListener('click', function() {
  if (PlayerStatus === 1) {
    pause();
  } else {
    play();
  }
});

/**
 * Handle Audio Player Status Chnages
 */
AudioPlayer.addEventListener('change', function(event) {
  Ti.App.fireEvent(WNAME + '.change', event);
  switch (event.state) {
    case Ti.Media.AUDIO_STATE_STARTING:
      if (event.source.url.indexOf('http') !== -1) {
        Alloy.Globals.loading.show('Waiting for buffer.');
      }
      break;
    case Ti.Media.AUDIO_STATE_PAUSED:
      PlayerStatus = 0;
      togglePlayPauseBtn();
      console.log('Ti.Media.AUDIO_STATE_PAUSED = ', event);
      break;
    case Ti.Media.AUDIO_STATE_PLAYING:
      Alloy.Globals.loading.hide();
      PlayerStatus = 1;
      togglePlayPauseBtn();
      break;
    case Ti.Media.AUDIO_STATE_STOPPED:
    case Ti.Media.AUDIO_STATE_STOPPING:
      console.log('Ti.Media.AUDIO_STATE_STOPPE', event.state === Ti.Media.AUDIO_STATE_STOPPED);
      console.log('Ti.Media.AUDIO_STATE_STOPPING', event.state === Ti.Media.AUDIO_STATE_STOPPING);
      PlayerStatus = 0;
      togglePlayPauseBtn();
      break;
    case Ti.Media.AUDIO_STATE_BUFFERING:
      PlayerStatus = 0;
      togglePlayPauseBtn();
      break;
    default:
      console.log('-==-A7A-==-', event);
      break;
  }
});

/**
 * Handle Aduio Plyaer when Track is finished playing.
 */
AudioPlayer.addEventListener('complete', function(event) {
  Ti.App.fireEvent(WNAME + '.complete', event);
  if (event.success) {
    console.log('Going to Next Track...');
    playNext(event);
  } else {
    console.log('{AudioPlayer Status Complete} = ', event);
  }
});

/**
 * Handle Audoi Player Progress Change
 */
AudioPlayer.addEventListener('progress', updateSeekerTime);

/**
 * Handle Audio Player Error events.
 */
AudioPlayer.addEventListener('error', function(e) {
  alert(e.error);
  Ti.App.fireEvent(WNAME + '.error', event);
  PlayerStatus = 0;
  togglePlayPauseBtn();
});

/**
 * Restart the current playing item
 */
function restartAudio(e) {
  stop();
  play();
}

/**
 * Play the previouse item in the playlist
 */
function playPrev(e) {
  if (CurrentPlayingItem === 0) {
    CurrentPlayingItem = Playlist.length - 1;
    Ti.App.fireEvent(WNAME + '.prev', Playlist[CurrentPlayingItem]);
    playItemAtIndex(CurrentTime);
  } else if (CurrentPlayingItem === Playlist.length - 1) {
    CurrentPlayingItem = 0;
    Ti.App.fireEvent(WNAME + '.prev', Playlist[CurrentPlayingItem]);
    playItemAtIndex(CurrentPlayingItem);
  } else {
    playItemAtIndex(--CurrentPlayingItem);
    Ti.App.fireEvent(WNAME + '.prev', Playlist[CurrentPlayingItem]);
  }
}

/**
 * Play the next item in the playlist
 */
function playNext(e) {
  if (CurrentPlayingItem >= 0 && CurrentPlayingItem < Playlist.length - 1) {
    console.log('playNext = Next Track');
    playItemAtIndex(++CurrentPlayingItem);
    Ti.App.fireEvent(WNAME + '.next', Playlist[CurrentPlayingItem]);
  } else {
    console.log('playNext = Going to the first of the playlist');
    playItemAtIndex(0);
    Ti.App.fireEvent(WNAME + '.next', Playlist[0]);
  }
}

/**
 * Update Player Timers on Progress
 */
function updateSeekerTime(event) {
  var prog = parseInt(event.progress / 1000);
  var duration = parseInt((AudioPlayer.duration / 1000)) - prog;

  //console.log('updateSeekerTime = ', event.progress, AudioPlayer.duration);

  //Calculate Duration
  duration = '-' + zeroPadding(parseInt((duration / 60))) + ':' + zeroPadding(parseInt((duration % 60)));
  //Calculate Progress
  prog = zeroPadding(parseInt((prog / 60))) + ':' + zeroPadding(parseInt((prog % 60)));

  TimeLeft.text = duration;
  TimeElapsed.text = prog;

  //Calculate Progress Percentage
  var SeekerPercent = (event.progress / AudioPlayer.duration) * 100;
  SeekerLine.width = SeekerPercent + '%';
  SeekerCricle.left = SeekerPercent + '%';
  event.str_duration = duration;
  event.str_progress = prog;
  Ti.App.fireEvent(WNAME + '.progress', event);
  //console.log('Player Progress = ', JSON.stringify(event));
}

/**
 * Add leading zero if number is less than 10
 *
 * @param {int} val
 * @return {string|int}
 */
function zeroPadding(val) {
  if (val < 10 && val >= 0) {
    return '0' + val;
  } else if (val >= 10) {
    return val;
  } else {
    return '00';
  }
}

/**
 * Toggles Play Pause Button Icon
 *
 * @return {void}
 */
function togglePlayPauseBtn() {
  if (PlayerStatus === 1) {
    PlayPauseBtn.image = WPATH('controls/pause.png');
  } else {
    PlayPauseBtn.image = WPATH('controls/play.png');
  }
}

/**
 * Play Audio
 */
function play() {
  AudioPlayer.start();
  PlayerStatus = 1;
  Ti.App.fireEvent('audioPlayer.play', Playlist[CurrentPlayingItem]);
  Ti.App.fireEvent(WNAME + '.play', Playlist[CurrentPlayingItem]);
  togglePlayPauseBtn();
}

/**
 * Pause Audio
 */
function pause() {
  AudioPlayer.pause();
  PlayerStatus = 0;
  Ti.App.fireEvent('audioPlayer.pause', Playlist[CurrentPlayingItem]);
  Ti.App.fireEvent(WNAME + '.pause', Playlist[CurrentPlayingItem]);
  togglePlayPauseBtn();
}

/**
 * Stop Audio
 */
function stop() {
  AudioPlayer.stop();
  PlayerStatus = 0;
  Ti.App.fireEvent(WNAME + '.stop', Playlist[CurrentPlayingItem]);
  togglePlayPauseBtn();
}

/**
 * Set Player Playlist
 *
 * @param {Object} playlist
 */
function setPlaylist(playlist) {
  if (typeof playlist !== 'object') {
    console.error('net.devloops.audioPlayer invalid playlist of type', typeof playlist);
    return;
  }
  Playlist = playlist;
}

/**
 * Play Item from Playlist
 *
 * @param {Object} index
 */
function playItemAtIndex(index) {
  console.log('playItemAtIndex = ', index);
  if (index > Playlist.length - 1) {
    console.error('net.devloops.audioPlayer index is out of playlist.');
    return;
  }

  //if plamying the same trakc was playing last time, just restart the player
  if (Playlist.length === 1) {
    AudioPlayer.restart();
    return;
  }

  //console.log("playItemAtIndex", index);
  //console.log("playItemAtIndex", Playlist[index]);
  if (Playlist[index]) {
    AudioPlayer.stop();
    if (OS_ANDROID) {
      AudioPlayer.release();
    }
    //Update current item index
    CurrentPlayingItem = index;
    //Update player title
    TrackTitle.text = Playlist[CurrentPlayingItem].title;
    //Update player album
    TrackAuthorAlbum.text = Playlist[CurrentPlayingItem].album;
    //set the new URL/URI of the file
    AudioPlayer.url = Playlist[CurrentPlayingItem].url;
    //set the player status to player
    PlayerStatus = 1;
    //toggle play/puase button
    togglePlayPauseBtn();
    //reset the seek time
    if (OS_ANDROID) {
      AudioPlayer.time = 0;
    } else {
      AudioPlayer.seekToTime(0);
    }
    //restart the player
    AudioPlayer.restart();
    Ti.App.fireEvent('audioPlayer.play', Playlist[CurrentPlayingItem]);
    if (OS_IOS) {
      updateRemoteControl();
    } else {
      createPlayerNotification();
    }
  }
}

/**
 * Update iOS Control Center Player Widget
 */
function updateRemoteControl() {
  iOSRemoteControl.setNowPlayingInfo({
    artist: '',
    title: TrackTitle.text,
    albumTitle: TrackAuthorAlbum.text,
    albumArtworkLocal: true, // true for LOCAL IMAGE false for REMOTE IMAGE
    albumArtwork: null, // LOCAL IMAGE - Image Name (eg: 'appicon.png') inside resources folder
    // REMOTE IMAGE - URL (eg: http://an.image.url)
  });
}

/**
 * Create a sticky notification for the player.
 * @TODO
 */
function createPlayerNotification() {
  return;
  try {
    var customView = Ti.Android.createRemoteViews({
      layoutId: Ti.App.Android.R.layout.notification_player
    });

    // Reference elements in the layout by prefixing the IDs with 'Ti.App.Android.R.id'
    customView.setTextViewText(Ti.App.Android.R.id.player_trackTitle, TrackTitle.text + " - " + TrackAuthorAlbum.text);
    customView.setImageViewResource(Ti.App.Android.R.id.player_icon, Ti.App.Android.R.drawable.logo);
    customView.setImageViewResource(Ti.App.Android.R.id.player_backward, Ti.App.Android.R.drawable.backward);
    customView.setImageViewResource(Ti.App.Android.R.id.player_forward, Ti.App.Android.R.drawable.forward);
    if (PlayerStatus === 1) {
      customView.setImageViewResource(Ti.App.Android.R.id.player_play_pause, Ti.App.Android.R.drawable.pause);
    } else {
      customView.setImageViewResource(Ti.App.Android.R.id.player_play_pause, Ti.App.Android.R.drawable.play);
    }
    var notification = Titanium.Android.createNotification({
      contentView: customView,
      flags: Titanium.Android.FLAG_NO_CLEAR | Titanium.Android.FLAG_ONGOING_EVENT | Titanium.Android.PRIORITY_MAX
    });

    Ti.Android.NotificationManager.notify(1, notification);
  } catch (e) {
    console.log(e);
  }
}

/**
 * Widget Next Item
 */
function next() {
  playNext({});
}

/**
 * Widget Prev item
 */
function prev() {
  playPrev({});
}

$.play = play;
$.pause = pause;
$.stop = stop;
$.setPlaylist = setPlaylist;
$.playItemAtIndex = playItemAtIndex;
$.next = next;
$.prev = prev;
$.playerStatus = function() {
  return PlayerStatus;
};

$.EVENTS = {
  PLAY: WNAME + '.play',
  PAUSE: WNAME + '.pause',
  STOP: WNAME + '.stop',
  NEXT: WNAME + '.next',
  PREV: WNAME + '.prev',
  PROGRESS: WNAME + '.progress',
  CHANGE: WNAME + '.change',
  COMPLETE: WNAME + '.complete',
  ERROR: WNAME + '.error',
  VOLUME_CHNAGE: WNAME + '.volumechange'
};
$.release = function() {
  AudioPlayer.stop();
  if (OS_ANDROID) {
    AudioPlayer.release();
  }
};