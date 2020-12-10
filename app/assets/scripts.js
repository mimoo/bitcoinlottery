"use strict";

//
// CONFIG
// 

var TIME_PLAY = 60 * 60 * 1000; // 1 hour

//
// Play component
//
var Play = React.createClass({

	// only display PlayNow
    getInitialState: function(){
		return {
			current_page: ''
		};
    },

    // check if the user can play
    componentDidMount: function() {
        $.getJSON('/can_play', function(status) {
      		console.log(status);
          	if(this.isMounted()) { // necessary?
          		var current_page = 'play_now';
          		if(!status['can_play_again'])
          			current_page = 'play_later';
    			this.setState({
      				current_page: current_page
      			});
          	}
        }.bind(this));
    },

    // the user clicked on the Play button
    handlePlay: function() {
		this.setState({current_page: 'play_again'});
    },

    // the user played and found something
    handleFound: function(result) {
		this.setState({current_page: 'found_something'});
    },

    // the user tried to play but he's counter is too high
    handleLater: function() {
		this.setState({current_page: 'play_later'});
    },

    // the timer is finished, the user can play again
    handlePlayAgain: function() {
		this.setState({current_page: 'play_now'});
    },

    //
    render: function() {
    	var partial;
    	switch(this.state.current_page){
    		case 'play_now':
    			partial = <PlayNow onClick={this.handlePlay} />;
    			break;
    		case 'play_later':
    			partial = <PlayLater timerFinished={this.handlePlayAgain} />;
    			break;
    		case 'play_again':
    			partial = <PlayAgain handleFound={this.handleFound} handleLater={this.handleLater} />;
    			break;
    		case 'found_something':
    			partial = <FoundSomething />;
    			break;
    		default:
    			partial = null;
    	}

		return (
			<div>
				{partial}
			</div>
		);
    }
});

//
// Play Now, the homepage with explanations and a button
// 
var PlayNow = React.createClass({
    getInitialState: function(){
		return {
		    button_status: ''
		};
    },

    handleClick: function() {
		this.setState({button_status: 'loading'});
		var this_ = this;
		$("#play_home").fadeOut(function(){
			this_.props.onClick();
		});
    },

    render: function() {
		var classes = 'ui button massive green ' + this.state.button_status;
		return (
		    <div id="play_home"> 
		    	<h1 className="ui header">Let's try to find a bitcoin wallet with money in it!</h1>
		    	<p>
		        Clicking on this button will generate a wallet and check if it already exists.<br />
		        If you find a wallet with some bitcoins inside, it's up to you to do whatever you want with it.
		      	</p>
		    	<button className={classes} onClick={this.handleClick}>Play!</button>
		    </div>
		);
    }
});


// Result of playing + Play Again button
var PlayAgain = React.createClass({

    getInitialState: function(){
		return {
		    button_status: 'loading',
		    publicKey: '',
		    privateKey: ''
		};
    },

    // when this is load we are supposed to play
    componentDidMount: function() {
		this.Play();
    },

    // happens after clicking on the play button!
    Play: function(){

    	this.setState({ button_status: 'loading' });
    	$("#loader").show();
    	$("#play_again").hide();

    	var this_ = this;

    	$.getJSON('/play', function(result){
		    console.log(result);
		    // why are you trying to play?
		    if(result['balance'] == -1)
		    	$("#play_again").fadeOut(function(){
		    		this_.props.handleLater();
		    	});
			// you won!
			else if(result['balance'] > 0){
				$("#loader").fadeOut(function(){
					this_.props.handleFound(result);
				});
			}
			else{
				// display sad results
				this_.setState({ 
					button_status: '',
					publicKey: result['public_key'],
					privateKey: result['private_key']
				});
				$("#loader").fadeOut(function(){
					$("#play_again").fadeIn();
				});
			}
		});
    },

    render: function() {
		var classes = 'ui button massive orange ' + this.state.button_status;
		return (
		    <div>

			    <div id="loader" className="ui segment" hidden>
			      <div className="ui active dimmer">
			        <div className="ui large text loader">Loading</div>
			      </div>
			      <p></p>
			      <p></p>
			      <p></p>
			    </div>

			    <div id="play_again">

				    <h1>It seems like this wallet does not contain money 😔</h1>
				    <p>The wallet you generated apparently doesn't have any money in it :(</p>
				    <a className="ui card">
				    <div className="content">
				    <div className="header">Wallet</div>
				    <div className="description">
				    <p>
				    wallet address: {this.state.publicKey}  <br />
				    private key: {this.state.privateKey}
				    </p>
				    </div>
				    </div>
				    <div className="extra content">
				    <div className="right floated author">
				    <i className="bitcoin icon"></i>
				    </div>
				    </div>
				    </a>

				    <div className={classes} onClick={this.Play}>Wanna play again ?</div>
				</div>
		    </div>
		);
    }
});

//
// Can't play anymore
//
var PlayLater = React.createClass({
    getInitialState: function(){
		return {
		    button_status: 'red disabled',
		    timer: ''
		};
    },

    // get the timer
    componentDidMount: function() {
		$.getJSON('/can_play', function(status) {
      		console.log(status);
          	if(this.isMounted()) { // necessary?
          		this.setState({ timer: status['timer'] });
        		this.decrementTimer();
          	}
        }.bind(this));
    },

    // decrement timer function
    decrementTimer: function(){
    	this.setState({ timer: this.state.timer - 1000 });
    	if(this.state.timer < 1000){
    		this.setState({ 
    			timer: 0,
    			button_status: 'green'
    		});
    	}
    	else{
    		setTimeout(this.decrementTimer, 1000);
    	}
    },

    handlePlayAgain: function(){

    	this.props.timerFinished();
    },

    render: function() {
    	// button
    	var classes = 'ui button massive ' + this.state.button_status;

		// timer
		var date = new Date(this.state.timer);
		//var hours = date.getHours();
		var minutes = "0" + date.getMinutes();
		var seconds = "0" + date.getSeconds();
		var formattedTime = minutes.substr(-2) + ':' + seconds.substr(-2);

		// progress bar
		var progress = 100 - Math.ceil(this.state.timer * 100 / TIME_PLAY);

		// 
		return (
		    <div>
			    <h1>You played enough.</h1>
			    <p>You now have to wait before you can play again!</p>
		    
			    <div className="ui statistic">
				    <div className="label">
				    Timer
				    </div>

				    <div className="value">
				    {formattedTime}
				    </div>
			    </div>
			    
			    <div data-percent={4} className="ui indicating progress active">
				    <div style={{ transitionDuration: '300ms', width: progress + '%'}} className="bar">
				    	<div className="progress"></div>
				    </div>
			    </div>

			    <button className={classes} onClick={this.handlePlayAgain}>
				    <i className="user icon"></i>
				    Play Again
			    </button>

		    </div>
		);
    }
});

// Wow you found something!
var FoundSomething = React.createClass({
    getInitialState: function(){
		return {
		    button_status: 'orange'
		};
    },

    handleClick: function() {
		this.setState({button_status: 'disabled'});
		var a = this;
		$("#play_again").fadeOut(function(){
		    a.setState({button_status: 'orange'});
		    $("#play").fadeIn();
		});
    },

    render: function() {
		var classes = 'ui button massive ' + this.state.button_status;
		return (
		    <div className={classes} onClick={this.handleClick}>Wanna play again ?</div>
		);
    }
});


//
// RENDERING
// 

React.render(
    <Play />,
    document.getElementById('play')
);
