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

    var messageContent = <p>{this.props.text}</p>

    if(this.props.url) {
      messageContent += <p><a href={this.props.url}>youtube</a></p>
    }

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
      <div className="panel-body flex-grow">
        <ul className="chat">
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text}
								url={message.url}
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
    if(this.state.text.length > 0) {
      e.preventDefault();
      var message = {
        user : this.props.user,
        text : this.state.text,
        timestamp : moment().unix()
      }
      this.props.onMessageSubmit(message);
      this.setState({ text: '' });
    }
	},

	changeHandler(e) {
    if(e.charCode == 13) {
      this.handleSubmit(e);
    } else {
      e.target.value += e.key;
		  this.setState({ text : e.target.value });
    }
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
            onKeyPress={this.changeHandler}
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

    var placeHolder = "Votre nom";
    var buttonText = "Joindre le chat";
    if(this.props.user && this.props.user.indexOf("noname") == -1) {
      placeHolder = this.props.user;
      buttonText = "Changer de nom";
    }

		return(
			<div className='panel-footer'>
        <div className="input-group">
          <input
            type="text"
            className="form-control input-sm"
            placeholder={placeHolder}
            onChange={this.onKey}
            value={this.state.newName}
          />
          <span className="input-group-btn">
            <button
              className="btn btn-warning btn-sm"
              onClick={this.handleSubmit}>
              {buttonText}
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
		//socket.on('user:join', this._userJoined);
		//socket.on('user:left', this._userLeft);
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
		messages.unshift(message);
		this.setState({messages});
	},

	_userJoined(data) {
		var {users, messages} = this.state;
		var {name} = data;
		users.push(name);
		messages.unshift({
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
		messages.unshift({
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
		messages.unshift({
			user: 'BIBOT',
			text : 'Change Name : ' + oldName + ' ==> '+ newName
		});
		this.setState({users, messages});
	},

	handleMessageSubmit(message) {
		var {messages} = this.state;
		messages.unshift(message);
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
      <div className="panel panel-primary flex-col">
        <div className="panel-heading">
          <span className="glyphicon glyphicon-comment"></span> Chat
        </div>
        <ChangeNameForm
          onChangeName={this.handleChangeName}
          user={this.state.user}
        />
        <MessageForm
          onMessageSubmit={this.handleMessageSubmit}
          user={this.state.user}
        />
        <MessageList
          messages={this.state.messages}
        />
      </div>
		);
	}
});

module.exports = Chat;
