[![gitTio](http://gitt.io/badge.svg)](http://gitt.io/component/net.devloops.audioPlayer)

# net.devloops.audioPlayer
Audio Player widget for Titanium with full-control with a design inspired by Apple Music Player.
this widget provides a full audio player experience, it supports local files and urls.


# Screenshots

![Andrid](https://github.com/AbdullahFaqeir/net.devloops.audioPlayer/blob/master/screenshots/5.png?raw=true)
![iOS iPhone](https://github.com/AbdullahFaqeir/net.devloops.audioPlayer/blob/master/screenshots/4.png?raw=true)
![iOS iPad](https://github.com/AbdullahFaqeir/net.devloops.audioPlayer/blob/master/screenshots/4.jpeg?raw=true)


# iOS
On iOS this widget updates the Control Center with the current played item and reposneds to the events from the Control Center.

# Android
A Player Notification Controller will be provided later.



# Installation 
you can install the widget directly by downloading a zip file from this repo. or you can download it usign [gitTio](http://gitt.io) package manager using the following command

```sh
$ gittio install .devloops.audioPlayer
```

# Usage & Implementation

You can easily use the widget with the following way.

```xml
<Widget id="audioPlayer" src="net.devloops.audioPlayer" />
```
Or you can create a instace of the widget programmatically with the following way.

```js
var AudioPlayer = Alloy.createWidget('net.devloops.audioPlayer').getView();
```

# API
The widget provides the following API.

| Method | Usage | Params |
| ------ | ------ | ------ |
| play() | Play the current track | None |
| pause() | Pause the current track | None |
| stop() | Stop the Audio Player | None |
| setPlaylist() | Set the playlist of the Player | Array of Objects Ex: [{url:'',title:'',album:''}] | 
| playItemAtIndex() | Plays an item from the playlist by it's index | Interger Ex: 0 or 1 |
| next() | Play the next track in the playlist | None |
| prev() | Play the previouse track in the playlist | None |
| playerStatus() | Returns the Player Status | None : Returns 0 if stopped or pause and 1 if playing |
| release() | For Android it releases the Player resource and for iOS it only stops the player. | None |


# Events 
| Event Name | Description | Params |
| ------ | ------ | ------ |
| net.devloops.audioPlayer.play | Fired when the player starts playing | Current Playing Track | 
| net.devloops.audioPlayer.pause | Fired when the player pauses playing | Current Playing Track | 
| net.devloops.audioPlayer.stop | Fired when the player stops playing | Current Playing Track | 
| net.devloops.audioPlayer.error | Fired when the player triggers a native error | Refer to Titanium Audio Player API | 
| net.devloops.audioPlayer.prev | Fired when the player plays the previous track | Current Playing Track | 
| net.devloops.audioPlayer.next | Fired when the player plays the next track | Current Playing Track | 
| net.devloops.audioPlayer.volumechange | Fired when the player volume slider is being updated | Native Slider Params Refer to Titanium Slider API | 
| net.devloops.audioPlayer.complete | Fired when the player finishes the current played track | Refer to Titanium Audio Player AP | 
| net.devloops.audioPlayer.change | Fired when the player finishes the current played track | Refer to Titanium Audio Player AP | 
| net.devloops.audioPlayer.progress | Fired on the playing progress | Refer to Titanium Audio Player AP + e.str_duration & e.str_progress | 


# Feature Work
To allow updating the player artwork for each track, as well as updating the Control Center for iOS, the Player Notification for Android.

# Contribution 
Pull request are welcome to add any new features to the widget.

License
----

MIT

# Author 
 - Abdullah Al-Faqeir
 - abdullah@devloops.net


- This widget is dedicated to my Friend and Brother [Waleed Saleh](mailto:waleed@devloops.net)

