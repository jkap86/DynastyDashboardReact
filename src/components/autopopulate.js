import React, { Component } from 'react';
import allPlayers from '../allplayers.json';

class Autopopulate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			player: '',
			keys: []
		}
	}

	componentDidMount() {
		let keys = Object.keys(allPlayers);
		this.setState({
			keys: keys
		});
	}

	render() {
		return <h2>
				<form>
					<input type="text" list="playersAuto" name={this.props.name}/>
					<datalist id="playersAuto">
						{this.state.keys.sort((a, b) => (allPlayers[a].last_name > allPlayers[b].last_name) ? 1 : (allPlayers[a].last_name === allPlayers[b].last_name) ? ((allPlayers[a].first_name > allPlayers[b].first_name) ? 1 : -1) : -1).map(key => 
							<option key={key}>
								{allPlayers[key].first_name + " " + allPlayers[key].last_name + " " + allPlayers[key].position + " " + (allPlayers[key].team === null ? 'FA' : allPlayers[key].team)}
							</option>
						)}
					</datalist>
				</form>
			</h2>
	}
}  

export default Autopopulate;