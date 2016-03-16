var React = require('react');
var ReactDOM = require('react-dom');

var News = require('./news');
var Music = require('./music');
var Chat = require('./chat');
var ProgressBar = require('./progressbar');

var App = React.createClass({
	render() {
		return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <ProgressBar />
          </div>
        </div>
        <div className="row flex-row">
          <div className="col-md-4 fill">
            <News />
          </div>
          <div className="col-md-4 fill">
            <Music />
          </div>
          <div className="col-md-4 fill">
            <Chat />
          </div>
        </div>
      </div>
		);
	}
});

ReactDOM.render(<App/>, document.getElementById('app'));
