import React, { Component } from 'react';
import Theme from './theme';
import axios from 'axios';
import allPlayers from '../allplayers.json';
import { Link } from 'react-router-dom';

class Roster extends Component {
	constructor(props) {
		super(props);
		this.state = {
			league_id: this.props.match.params.league_id,
			league_name: '',
			username: this.props.match.params.username,
			user_id: '',
			players: []
		}
	}

	
	
	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			this.setState({
				user_id: res.data.user_id
			})
		})
		axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}`)
		.then(res => {
			this.setState({
				league_name: res.data.name
			})
		})
		axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}/rosters`)
		.then(res => {
			let rosters = res.data === null ? [] : res.data;
			for (let i = 0; i < rosters.length; i++) {
				if (rosters[i].owner_id === this.state.user_id && rosters[i].players !== null) {
					for (let j = 0; j < rosters[i].players.length; j++) {
						let players = this.state.players.concat(rosters[i].players[j]);
						this.setState({
							players: players
						})
					}	
				}
			}
		})
	}

	render() {
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1>{this.state.username}</h1>
			<h2>{this.state.league_name}</h2>
			<table>
				<thead>
					<tr>
						<th>Position</th>
						<th>Number</th>
						<th>Name</th>
						<th>Team</th>
						<th>College</th>
						<th>Age</th>
						<th>Years Exp</th>
					</tr>
				</thead>
				<tbody>
				{this.state.players.sort((a, b) => (allPlayers[a].position > allPlayers[b].position) ? 1 : -1).map(player => 
					<tr key={player} className="row">
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number}</td>
						<td>{allPlayers[player].first_name} {allPlayers[player].last_name}</td>
						<td>{allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
	}
}

export default Roster;