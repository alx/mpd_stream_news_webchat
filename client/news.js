var React = require('react');

var socket = io.connect();

var News = React.createClass({

	getInitialState() {
		return {news: []};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('news:item', this._newsReceive);
	},

	_initialize(data) {
		this.setState({
      news: data.news
    });
	},

	_newsReceive(item) {
		var {news} = this.state;
		news.push(item);
		this.setState({news});
	},

	render() {
		return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <span className="glyphicon glyphicon-info-sign"></span> Dernière Nouvelles
        </div>
      </div>
		);
	}
});

module.exports = News;
