var React = require('react');
var ReactDOM = require('react-dom');

var News = require('./news');
var Music = require('./music');
var Chat = require('./chat');

var App = React.createClass({
	render() {
		return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-4">
            <News />
          </div>
          <div className="col-md-4">
            <Music />
          </div>
          <div className="col-md-4">
            <Chat />
          </div>
        </div>
      </div>
		);
	}
});

ReactDOM.render(<App/>, document.getElementById('app'));
