import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./homepage.css";
import Theme from './theme';
import allPlayers from '../allplayers.json';
import axios from 'axios';

class Matchups extends Component {
	constructor(props) {
		super(props);
		this.state = {
			week: this.props.match.params.week,
			username: this.props.match.params.username,
			user_id: '',
			players: [],
			oppPlayers: [],
			playersDict: [],
			oppPlayersDict: []
		}
	}

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			const userID = res.data.user_id
			this.setState({
				user_id: userID
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				let leagues = res.data
				for (let i = 0; i < leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${leagues[i].league_id}/rosters`)
					.then(res => {
						let rid = res.data.find(x => x.owner_id === this.state.user_id) === undefined ? null : res.data.find(x => x.owner_id === this.state.user_id).roster_id
						axios.get(`https://api.sleeper.app/v1/league/${leagues[i].league_id}/matchups/${this.state.week}`)
						.then(res => {
							let matchup = res.data.find(x => x.roster_id === rid || (x.co_owners !== undefined && x.co_owners.includes(x.roster_id)))
							let starters = this.state.players.concat(matchup === undefined ? null : matchup.starters)
							let opponent = res.data.find(x => x !== undefined && matchup !== undefined && x.matchup_id === matchup.matchup_id && x.roster_id !== rid)
							let oppStarters = this.state.oppPlayers.concat(opponent === undefined ? null : opponent.starters)
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
								players: starters,
								oppPlayers: oppStarters,
								playersDict: findOccurences(starters),
								oppPlayersDict: findOccurences(oppStarters)
							})
						})
					})
				}
			})
		})
	}

	render() {
		return <>
				<Link to="/" className="link">Home</Link>
				<Theme/>
				<h1>Matchups</h1>
				<h2>{this.state.username} Week {this.state.week}</h2>
				<table style={{  margin: 'auto', width: '75%'}}>
					<tr>
						<th>Starters</th>
						<th>Opponent Starters</th>
					</tr>
					<tr style={{ verticalAlign: 'top'}}>
						<td>
							{this.state.playersDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(player => 
								<tr className="row"><td>{allPlayers[player.name] === undefined ? player.name : (allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team)}</td><td>{player.count}</td><td>({this.state.oppPlayersDict.find(x => x.name === player.name) === undefined ? 0 : this.state.oppPlayersDict.find(x => x.name === player.name).count})</td></tr>
								)}
						</td>
						<td>
							{this.state.oppPlayersDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(player =>
								<tr className="row"><td>{allPlayers[player.name] === undefined ? player.name : (allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team)}</td><td>{player.count}</td></tr>
								)}
						</td>
					</tr>
				</table>
			</>
	}
}

export default Matchups;