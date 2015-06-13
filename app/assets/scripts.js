var PlayButton = React.createClass({
    getInitialState: function(){
	return {
	    button_status: 'active'
	};
    },
    handleClick: function() {
	this.setState({button_status: 'loading'});
	$.getJSON('/play', function(result){
	    console.log(result);
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
