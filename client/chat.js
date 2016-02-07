var React = require('react');
var moment = require('moment');

var socket = io.connect();

var UsersList = React.createClass({
	render() {
		return (
			<div className='users'>
				<h3> Online Users </h3>
				<ul>
					{
						this.props.users.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>
			</div>
		);
	}
});

var Message = React.createClass({
	render() {
		return (
      <li className="left clearfix">
        <div className="chat-body clearfix">
          <div className="header">
            <strong className="primary-font">{this.props.user}</strong>
            <small className="pull-right text-muted">
              <span className="glyphicon glyphicon-time"></span>
              {moment.unix(this.props.timestamp).fromNow()}
            </small>
          </div>
		      <p>{this.props.text}</p>
        </div>
      </li>
		);
	}
});

var MessageList = React.createClass({
	render() {
		return (
      <div className="panel-body">
        <ul className="chat">
				{
					this.props.messages.reverse().map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text}
								timestamp={message.timestamp}
							/>
						);
					})
				}
        </ul>
      </div>
		);
	}
});

var MessageForm = React.createClass({

	getInitialState() {
		return {text: ''};
	},

	handleSubmit(e) {
		e.preventDefault();
		var message = {
			user : this.props.user,
			text : this.state.text,
      timestamp : moment().unix()
		}
		this.props.onMessageSubmit(message);
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {

    if(!this.props.user || this.props.user.indexOf("noname") == 0) {
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

var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render() {
		return(
			<div className='panel-footer'>
        <div className="input-group">
          <input
            type="text"
            className="form-control input-sm"
            placeholder="Votre nom"
            onChange={this.onKey}
            value={this.state.newName}
          />
          <span className="input-group-btn">
            <button
              className="btn btn-warning btn-sm"
              onClick={this.handleSubmit}>
                Utiliser ce nom
            </button>
          </span>
        </div>
			</div>
		);
	}
});

var Chat= React.createClass({

	getInitialState() {
		return {users: [], messages:[], text: ''};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageReceive);
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		//socket.on('change:name', this._userChangedName);
	},

	_initialize(data) {
		this.setState({
      messages: data.messages,
      users: data.users,
      user: data.name
    });
	},

	_messageReceive(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	},

	_userJoined(data) {
		var {users, messages} = this.state;
		var {name} = data;
		users.push(name);
		messages.push({
			user: 'BIBOT',
			text : name +' est arrivé',
      timestamp: moment().unix()
		});
		this.setState({users, messages});
	},

	_userLeft(data) {
		var {users, messages} = this.state;
		var {name} = data;
		var index = users.indexOf(name);
		users.splice(index, 1);
		messages.push({
			user: 'BIBOT',
			text : name +' est parti',
      timestamp: moment().unix()
		});
		this.setState({users, messages});
	},

	_userChangedName(data) {
		var {oldName, newName} = data;
		var {users, messages} = this.state;
		var index = users.indexOf(oldName);
		users.splice(index, 1, newName);
		messages.push({
			user: 'APPLICATION BOT',
			text : 'Change Name : ' + oldName + ' ==> '+ newName
		});
		this.setState({users, messages});
	},

	handleMessageSubmit(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
		socket.emit('send:message', message);
	},

	handleChangeName(newName) {
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, (result) => {
			if(!result) {
				return alert('There was an error changing your name');
			}
			var {users} = this.state;
			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			this.setState({users, user: newName});
		});
	},

	render() {
		return (
      <div className="panel panel-primary">
        <div className="panel-heading">
          <span className="glyphicon glyphicon-comment"></span> Chat
        </div>
        <MessageList
          messages={this.state.messages}
        />
        <MessageForm
          onMessageSubmit={this.handleMessageSubmit}
          user={this.state.user}
        />
        <ChangeNameForm
          onChangeName={this.handleChangeName}
        />
      </div>
		);
	}
});

module.exports = Chat;