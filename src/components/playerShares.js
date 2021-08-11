import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import allPlayers from '../allplayers.json';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';


class PlayerShares extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username,
			user_id: '',
			leagues: [],
			players: [],
			playersDict: [],
			avatar: '',
			qbcheck: true,
			rbcheck: true,
			wrcheck: true,
			techeck: true

		}
		this.filterPosition = this.filterPosition.bind(this)
	}

	filterPosition(e) {
		const position = e.target.value
		const name = e.target.name
		let positionSelected = document.getElementsByClassName(position)
		for (let i = 0; i < positionSelected.length; i++) {
			positionSelected[i].style.display = positionSelected[i].style.display === 'none' ? 'table-row' : 'none' 
		}
		this.setState({
			[name]: e.target.checked
		})
	} 

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			this.setState({
				user_id: res.data.user_id,
				avatar: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				this.setState({
					leagues: res.data
				})
				for (let i = 0; i < this.state.leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues[i].league_id}/rosters`)
					.then(res => {
						let rosters = res.data;
						for (let j = 0; j < rosters.length; j++) {
							if (rosters[j].owner_id === this.state.user_id) {
								let players = this.state.players.concat(rosters[j].players === null ? [] : rosters[j].players)
								const findOccurences = (players = []) => {
									const res = [];
									players.forEach(el => {
										const index = res.findIndex(obj => {
											return obj['name'] === el;
										});
										if (index === -1) {
											res.push({
												"name": el,
												"count": 1
											})
										}
										else {
											res[index]["count"]++;
										};
									});
									return res;
								};
								this.setState({
									players: players,
									playersDict: findOccurences(players)
								})
							}
						}
					})
				}
			})
		})
	}

	render() {
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1><img src={this.state.avatar}/>{this.state.username} Player Shares</h1>
			<h2>{this.state.leagues.length} Leagues</h2>
			<label>
				Position
				QB <input value="QB" name="qbcheck" checked={this.state.qbcheck} onChange={this.filterPosition} type="checkbox"/>
				RB <input value="RB" name="rbcheck" checked={this.state.rbcheck} onChange={this.filterPosition} type="checkbox"/>
				WR <input value="WR" name="wrcheck" checked={this.state.wrcheck} onChange={this.filterPosition} type="checkbox"/>
				TE <input value="TE" name="techeck" checked={this.state.techeck} onChange={this.filterPosition} type="checkbox"/>
			</label>
			<table>
				<thead>
					<tr>
						<th>Player</th>
						<th>Age</th>
						<th>College</th>
						<th>Years Exp</th>
						<th>Shares</th>
					</tr>
				</thead>
				<tbody>
				{this.state.playersDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(player => 
					<tr key={player.name} className={`row player ${allPlayers[player.name].position}`}>
						<td>{allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team}</td>
						<td>{allPlayers[player.name].age}</td>
						<td>{allPlayers[player.name].college}</td>
						<td>{allPlayers[player.name].years_exp}</td>
						<td>{player.count}</td>
						<td style={{ paddingBottom: '10px' }}><Link to={'/playersearch/' + this.state.username + '/' + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].position + " " + (allPlayers[player.name].team === null ? 'FA' : allPlayers[player.name].team)}><button><span className="front">Search Player</span></button></Link></td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
	}
}

export default PlayerShares;