var React = require('react');
var moment = require('moment');
var urlRegex = require('url-regex');

var socket = io.connect();

var NewsForm = React.createClass({

	getInitialState() {
		return {text: ''};
	},

	handleSubmit(e) {
		e.preventDefault();
		var item = {
			text : this.state.text,
      timestamp : moment().unix()
		}
		this.props.onNewsSubmit(item);
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {

    if(!this.props.isAdmin) {
      return null;
    }

		return(
			<div className='panel-footer'>
        <div className="input-group">
          <input
            type="text"
            className="form-control input-sm"
            placeholder="Votre message ici..."
            onChange={this.changeHandler}
            value={this.state.text}
          />
          <span className="input-group-btn">
            <button
              className="btn btn-warning btn-sm"
              onClick={this.handleSubmit}>
                Envoyer
            </button>
          </span>
        </div>
			</div>
		);
	}
});

var NewsItem = React.createClass({
	render() {

    var content = <p>{this.props.text}</p>

    if(urlRegex().test(this.props.text)) {
      content = <p><a href={this.props.text}>{this.props.text}</a></p>
    }

    if(urlRegex().test(this.props.text) && this.props.text.endsWith('.jpg')) {
      content = <p><img className="img-responsive" src={this.props.text}/></p>
    }

		return (
      <li className="left clearfix">
        <div className="news-body clearfix">
          <div className="header">
            <small className="pull-right text-muted">
              <span className="glyphicon glyphicon-time"></span>
              {moment.unix(this.props.timestamp).format("DD/MM/YYYY - HH:mm")}
            </small>
          </div>
          {content}
        </div>
      </li>
		);
	}
});

var NewsList = React.createClass({
	render() {
		return (
      <ul className="news">
      {
        this.props.news.map((message, i) => {
          return (
            <NewsItem
              key={i}
              text={message.text}
              timestamp={message.timestamp}
            />
          );
        })
      }
      </ul>
		);
	}
});

var News = React.createClass({

	getInitialState() {
		return {news: [], isAdmin: false};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('admin', this._admin);
		socket.on('news:item', this._newsReceive);
	},

	_initialize(data) {
		this.setState({
      news: data.news,
      isAdmin: false
    });
	},

  _admin() {
    this.setState({news: this.state.news, isAdmin: true});
  },

	_newsReceive(item) {
		var {news} = this.state;
		news.unshift(item);
		this.setState({news: news, isAdmin: this.state.isAdmin});
	},

	handleMessageSubmit(item) {
    var intRegex = /^\d+$/;
    if(!intRegex.test(item.text)) {
      var {news} = this.state;
      news.unshift(item);
      this.setState({news});
    }
		socket.emit('send:news', item);
	},

	render() {
		return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <span className="glyphicon glyphicon-info-sign"></span> Dernière Nouvelles
        </div>
        <div className="panel-body">
          <NewsForm
            onNewsSubmit={this.handleMessageSubmit}
            isAdmin={this.state.isAdmin}
          />
          <NewsList
            news={this.state.news}
          />
        </div>
      </div>
		);
	}
});

module.exports = News;
