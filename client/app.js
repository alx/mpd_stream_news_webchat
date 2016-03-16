var React = require('react');
var ReactDOM = require('react-dom');

var News = require('./news');
var Music = require('./music');
var Chat = require('./chat');

var App = React.createClass({
	render() {
		return (
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="progress">
              <div className="progress-bar progress-bar-striped active progress-bar-success" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style={{width: '10%'}}>
                <span className="sr-only">45% Complete</span>
              </div>
            </div>
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
