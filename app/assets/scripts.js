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
        $.get('/can_play', function(status) {
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
    	var a = this;
		$.getJSON('/play', function(result){
		    console.log(result);

			if(result['balance'] > 0)
			    a.setState({current_page: 'found_something'});
			else if(result['can_play_again'])
				a.setState({current_page: 'play_again'});
			else
			    a.setState({current_page: 'play_later'});
		})
    },

    //
    render: function() {
    	var partial;
    	switch(this.state.current_page){
    		case 'play_now':
    			partial = <PlayNow onClick={this.handlePlay}/>;
    			break;
    		case 'play_later':
    			partial = <PlayLater />;
    			break;
    		case 'play_again':
    			partial = <PlayAgain />;
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


// Play Now!
var PlayNow = React.createClass({
    getInitialState: function(){
		return {
		    button_status: 'green'
		};
    },

    handleClick: function() {
		this.setState({button_status: 'loading'});
		// make the request
		// fade this
		// parent.play_again -> true
	    this.props.onClick();
    },

    render: function() {
		var classes = 'ui button massive ' + this.state.button_status;
		return (
		    <div> 
		    	<h1 className="ui header">Let's try to find a bitcoin wallet with money!</h1>
		    	<p>
		        You generate a wallet (private and public key) and check if there is money in it in with just <strong>1 click !</strong><br />
		        If you find a wallet with some money inside, it's up to you to do whatever you want with it
		      	</p>
		    	<button className={classes} onClick={this.handleClick}>Play!</button>
		    </div>
		);
    }
});


// Result of playing
var PlayAgain = React.createClass({
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
		    <div>
			    <h1>It seems like this wallet does not contain money </h1>
			    <p>The wallet you generated apparently doesn't have any money in it :(</p>
			    <a className="ui card" href="http://www.dog.com">
			    <div className="content">
			    <div className="header">Wallet</div>
			    <div className="meta">
			    <span className="category">Animals</span>
			    </div>
			    <div className="description">
			    <p></p>
			    </div>
			    </div>
			    <div className="extra content">
			    <div className="right floated author">
			    <img className="ui avatar image" src="/images/avatar/small/matt.jpg" /> Matt
			    </div>
			    </div>
			    </a>

			    <div className={classes} onClick={this.handleClick}>Wanna play again ?</div>
		    </div>
		);
    }
});



// Can't play anymore
var PlayLater = React.createClass({
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
		classes = 'ui button massive ' + this.state.button_status;
		return (
		    <div>
		    
		    <div className="ui statistic">
		    <div className="label">
		    Timer
		    </div>
		    <div className="value">
		    04:05
		    </div>
		    </div>
		    
		    <div data-percent={4} className="ui basic demo progress active">
		    <div style={{ transitionDuration: '300ms', width: '4%'}} className="bar">
		    <div className="progress"></div>
		    </div>
		    <div className="label">4% Complete</div>
		    </div>

		    <div className="ui disabled button">
		    <i className="user icon"></i>
		    Play Again
		    </div>

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
