var React = require('react');
var classname = require('classname');

var socket = io.connect();

var jplayer = null;
var stream = {
  title: "Naissance",
  mp3: "http://swyn.fr:8008/naissance"
},
ready = false;

var MusicControl = React.createClass({

  componentWillUpdate: function(nextProps, nextState) {
    if(this.refs.jplayer && jplayer == undefined) {

      jplayer = $(this.refs.jplayer).jPlayer({
        ready: function (event) {
          ready = true;
          $(this).jPlayer("setMedia", stream).jPlayer('play');
        },
        pause: function() {
          $(this).jPlayer("clearMedia");
        },
        error: function(event) {
          if(ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
            // Setup the media stream again and play it.
            $(this).jPlayer("setMedia", stream).jPlayer("play");
          }
        },
        swfPath: "bower_components/jPlayer/dist/jplayer",
        supplied: "mp3",
        preload: "none",
        wmode: "window",
        useStateClassSkin: true,
        autoBlur: false,
        keyEnabled: true
      });
    }
  },

  setVolumeOff() {
    $('.glyphicon').addClass('hidden');
    $('.glyphicon-volume-off').removeClass('hidden');
    $(this.refs.jplayer).jPlayer("clearMedia");
  },

  setVolumeUp() {
    $('.glyphicon').addClass('hidden');
    $('.glyphicon-volume-up').removeClass('hidden');
    $(this.refs.jplayer).jPlayer("setMedia", stream).jPlayer('play');
  },

	render() {
		return (
      <div className="music-control">
        <span className="pull-right glyphicon glyphicon-volume-off hidden" onClick={this.setVolumeUp}></span>
        <span className="pull-right glyphicon glyphicon-volume-up" onClick={this.setVolumeOff}></span>
        <div className='music-player'>
          <div id="jquery_jplayer" className="jp-jplayer" ref="jplayer"></div>
          <div id="jp_container_1" className="jp-audio-stream" role="application" aria-label="media player">
            <div className="jp-type-single">
              <div className="jp-no-solution">
                <span>Update Required</span>
                To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
              </div>
            </div>
          </div>
        </div>
			</div>
		);
	}
});

var MusicPlaylistTrack = React.createClass({

	getInitialState() {
		return {track: null};
	},

	render() {

    const thumbUrl = "/download/" + this.props.track.file.replace('mp3', 'jpg');
    const title = this.props.track.file.replace(/-.{11}.mp3$/gi, '').replace(/_/gi, ' ');
    const style = classname({media: true, current: this.props.track.current});

		return (
      <li className={style}>
        <img className="pull-left img-responsive" src={thumbUrl} />
        <div className="media-body">
          <h4 className="media-heading">{title}</h4>
        </div>
      </li>
		);
	}
});

var MusicPlaylist = React.createClass({

	getInitialState() {
		return {playlist: []};
	},

	render() {
		return (
			<ul className='music-playlist media-list'>
      {
        this.props.playlist.map((track, i) => {
          return <MusicPlaylistTrack key={i} track={track}/>
        })
      }
      </ul>
		);
	}
});

var Music= React.createClass({

	getInitialState() {
		return {playlist: []};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('playlist', this._playlistReceive);
	},

	_initialize(data) {
		this.setState({
      playlist: data.playlist
    });
	},

	_playlistReceive(playlist) {
		var {playlist} = playlist
		this.setState({playlist});
	},

	render() {
		return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <MusicControl />
          <span className="glyphicon glyphicon-music"></span> Music
        </div>
        <div className="panel-body">
          <MusicPlaylist
            playlist={this.state.playlist}
          />
        </div>
      </div>
		);
	}
});

module.exports = Music;
