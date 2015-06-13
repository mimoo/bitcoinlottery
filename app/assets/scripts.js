// first button you can press to play :)
var PlayButton = React.createClass({
    getInitialState: function(){
	return {
	    button_status: 'green'
	};
    },
    handleClick: function() {
	var a = this
	this.setState({button_status: 'loading'});
	$.getJSON('/play', function(result){
	    console.log(result);
	    $("#play").fadeOut(function(){
		a.setState({ button_status: 'green' });
		if(result['balance'] == 0){
		    $("#play_again").fadeIn();
		}
		else{
		    $("#play_again").fadeIn();
		}
	    });
	});
    },
    render: function() {
	classes = 'ui button massive ' + this.state.button_status;
	return (
	    <div className={classes} onClick={this.handleClick}>Play !</div>
	);
    }
});

React.render(
    <PlayButton />,
    document.getElementById('play_button')
);

// second button to play again :o
var PlayAgainButton = React.createClass({
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
	    <div className={classes} onClick={this.handleClick}>Wanna play again ?</div>
	);
    }
});

React.render(
    <PlayAgainButton />,
    document.getElementById('play_again_button')
);

