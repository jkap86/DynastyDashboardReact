import React, { Component } from 'react';
import Theme from './theme';
import axios from 'axios';
import allPlayers from '../allplayers.json';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';

class Roster extends Component {
	constructor(props) {
		super(props);
		this.state = {
			league_id: this.props.match.params.league_id,
			league_name: '',
			username: this.props.match.params.username,
			user_id: '',
			avatar: '',
			league_avatar: '',
			players: [],
			playerValues: [],
			value: '',
			teams: [],
			record: ''
		}
		this.changeTeam = this.changeTeam.bind(this);
	}

	changeTeam(e) {
		this.setState({
			username: e.target.innerHTML
		})
	}


	componentDidMount() {
		fetch('/dynastyvalues')
		.then(res => res.json()).then(data => {
			let players = data.name
			for (let i = 0; i < players.length; i++) {
				let playerx = this.state.playerValues.concat({
					name: players[i].name,
					searchName: players[i].searchName,
					team: players[i].team,
					value: players[i].value,
					position: players[i].position
				})
				this.setState({
					playerValues: playerx
				})
			}
		})
		

		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			this.setState({
				user_id: res.data.user_id,
				avatar: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
		})
		axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}`)
		.then(res => {
			this.setState({
				league_name: res.data.name,
				league_avatar: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
		})
		axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}/rosters`)
		.then(res => {
			let rosters = res.data === null ? [] : res.data;
			for (let i = 0; i < rosters.length; i++) {
				if (rosters[i].owner_id === this.state.user_id && rosters[i].players !== null) {
					let record = rosters[i].settings.wins + " - " + rosters[i].settings.losses
					this.setState({
						record: record
					}) 
					for (let j = 0; j < rosters[i].players.length; j++) {
						let players = this.state.players.concat(rosters[i].players[j]);
						this.setState({
							players: players
						})
					}	
				}
				else if (rosters[i].players !== null) {
					axios.get(`https://api.sleeper.app/v1/user/${rosters[i].owner_id}`)
					.then(res => {
						let teams = this.state.teams.concat({
							name: res.data.display_name,
							avatar: `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`,
							players: rosters[i].players,
							record: rosters[i].settings.wins + " - " + rosters[i].settings.losses
						})
						this.setState({
							teams: teams
						})
					})
				}
			}
		})
		

	}

	render() {
		for (let i = 0; i < this.state.players.length; i++) {
			let p = this.state.playerValues.find(x => x.searchName === allPlayers[this.state.players[i]].search_full_name)
			allPlayers[this.state.players[i]].value = p === undefined ? '0' : p.value
		}
		for (let i = 0; i < this.state.teams.length; i ++) {
			for (let j = 0; j < this.state.teams[i].players.length; j++) {
				let p = this.state.playerValues.find(x => x.searchName === allPlayers[this.state.teams[i].players[j]].search_full_name)
				allPlayers[this.state.teams[i].players[j]].value = p === undefined ? '0' : p.value
			}
			let teamValue = this.state.teams[i].players.reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0)
			this.state.teams[i].teamValue = teamValue
		}


		let value = this.state.players.reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0)
		let players = this.state.players.sort((a, b) => (allPlayers[a].position > allPlayers[b].position) ? 1 : (Number(allPlayers[a].value) < Number(allPlayers[b].value)) ? 1 : -1)
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<table style={{ height: "initial"}}>
			<tr>
				{this.state.teams.sort((a, b) => a.teamValue < b.teamValue ? 1 : -1).map(team =>
					<td><img src={team.avatar} /><a onClick={this.changeTeam} value={team.name}>{team.name}</a><br/>{team.record}<br/>{team.players.reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</td>
				)}
			</tr>
			</table>
			<h1><img src={this.state.avatar}/>{this.state.username}</h1>
			<h2>{this.state.league_name}<img src={this.state.league_avatar}/></h2>
			<h2>{this.state.record}</h2>
			<h2>{value.toLocaleString("en-US")}</h2>
			<h3>
				Weighted Ages
				<ol style={{ display: 'grid'}}>
					<li>QB: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'QB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'QB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>
					<li>RB: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'RB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'RB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>
					<li>WR: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'WR').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'WR').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>
					<li>TE: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'TE').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'TE').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>
				</ol>
			</h3>
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
						<th>Dynasty Value</th>
					</tr>
				</thead>
				<tbody>
				{players.map(player => 
					<tr key={player} className="row">
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number}</td>
						<td>{allPlayers[player].first_name} {allPlayers[player].last_name}</td>
						<td>{allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
	}
}

export default Roster;