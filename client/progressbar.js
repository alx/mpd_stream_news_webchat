var React = require('react');

var socket = io.connect();

var ProgressBar = React.createClass({

	getInitialState() {
		return {percent: '0%'};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:progress', this._progressReceive);
	},

	_initialize(data) {
		this.setState({
      percent: '0%'
    });
	},

	_progressReceive(percent) {
		this.setState({
      percent: percent + '%'
    });
	},

	render() {
		return (
      <div className="progress">
        <div className="progress-bar progress-bar-striped active progress-bar-success" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style={{width: this.state.percent}}>
        </div>
      </div>
		);
	}
});

module.exports = ProgressBar;
