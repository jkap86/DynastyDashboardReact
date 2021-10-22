import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import allPlayers from '../allplayers.json';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';

class PlayerSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username.replace(/ /g,'').toLowerCase(),
			player: this.props.match.params.player,
			user_id: '',
			avatar: '',
			player_id: '',
			leagues: [],
			rosters: [],
			info: [],
			players: []
		}
		this.toggleOwned = this.toggleOwned.bind(this);
		this.toggleAvailable = this.toggleAvailable.bind(this);
		this.showBestBall = this.showBestBall.bind(this);
		this.showStandard = this.showStandard.bind(this);
	}

	toggleOwned() {
		let not_owned = document.getElementsByClassName("not_owned");
		let available = document.getElementsByClassName("available");
		if (not_owned.length > 0 && not_owned[0].style.display === "none") {
			for (let i = 0; i < not_owned.length; i++) {
				not_owned[i].style.display = "table-row";
			}
			for (let i = 0; i < available.length; i++) {
				available[i].style.display = "table-row";
			}
		}else {
			for (let i = 0; i < not_owned.length; i++) {
				not_owned[i].style.display = "none";
			}
			for (let i = 0; i < available.length; i++) {
				available[i].style.display = "none";
			}
		}	
	}

	toggleAvailable() {
		let owned = document.getElementsByClassName("owned");
		let not_owned = document.getElementsByClassName("not_owned");
		if (owned.length > 0 && owned[0].style.display === "none") {
			for (let i = 0; i < owned.length; i++) {
				owned[i].style.display = "table-row";
			}
			for (let i = 0; i < not_owned.length; i++) {
				not_owned[i].style.display = "table-row";
			}
		}else {
			for (let i = 0; i < owned.length; i++) {
				owned[i].style.display = "none";
			}
			for (let i = 0; i < not_owned.length; i++) {
				not_owned[i].style.display = "none";
			}
		}		
	}

	showBestBall() {
		let bestball = document.getElementsByClassName("bestball")
		let checkbox = document.getElementById("bestball")
		if (checkbox.checked === true) {
			for (let i = 0; i < bestball.length; i ++) {
				bestball[i].style.display = "table-row";
			}
		}else {
			for (let i = 0; i < bestball.length; i++) {
				bestball[i].style.display = "none"
			}
		}
	}

	showStandard() {
		let standard = document.getElementsByClassName("standard")
		let checkbox = document.getElementById("standard")
		if (checkbox.checked === true) {
			for (let i = 0; i < standard.length; i ++) {
				standard[i].style.display = "table-row";
			}
		}else {
			for (let i = 0; i < standard.length; i++) {
				standard[i].style.display = "none"
			}
		}

	}

	componentDidMount() {
		document.getElementById("standard").checked = true;
		document.getElementById("bestball").checked = true;
		let keys = Object.keys(allPlayers);
		for (let i = 0; i < keys.length; i++) {
			if ((allPlayers[keys[i]].first_name + " " + allPlayers[keys[i]].last_name + " " + allPlayers[keys[i]].position + " " + (allPlayers[keys[i]].team === null ? 'FA' : allPlayers[keys[i]].team)) === this.state.player)  {
				let player_id = keys[i];
				this.setState({
					player_id: player_id
				})
			}
		}
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			let user_id = res.data.user_id;
			this.setState({
				user_id: user_id,
				avatar: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				let leagues = res.data;
				this.setState({
					leagues: leagues
				})
				for (let i = 0; i < this.state.leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues[i].league_id}/rosters`)
					.then(res => {
						let rosters = res.data;
						let owner = rosters.find(x => x.players !== null && x.players.includes(this.state.player_id))
						let user = rosters.find(x => x.owner_id === this.state.user_id)
						let ownerID = owner === undefined ? 'available' : owner.owner_id
						let wins = owner === undefined ? 0 : owner.settings.wins
						let losses = owner === undefined ? 0 : owner.settings.losses
						let status = owner === undefined ? '-' : (owner.starters.includes(this.state.player_id) ? 'starter' : (owner.taxi !== null && owner.taxi.includes(this.state.player_id) ? 'taxi' : (owner.reserve !== null && owner.reserve.includes(this.state.player_id) ? 'IR' : 'bench')))
						axios.get(`https://api.sleeper.app/v1/user/${ownerID}`)
						.then(res =>{
							let ownerName = res.data.username
							let info = this.state.info.concat({
								name: this.state.leagues[i].name,
								avatar: this.state.leagues[i].avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${this.state.leagues[i].avatar}`,
								owner: ownerName,
								league_id: this.state.leagues[i].league_id,
								wins: wins,
								losses: losses,
								status: status,
								pwins: owner === undefined || owner.metadata === null || owner.metadata.record === undefined ? 0 : (owner.metadata.record.match(/W/g) || []).length,
								plosses: owner === undefined || owner.metadata === null || owner.metadata.record === undefined ? 0 : (owner.metadata.record.match(/L/g) || []).length,
								bestball: this.state.leagues[i].settings.best_ball,
								budget: this.state.leagues[i].settings.waiver_budget,
								budget_used_owner: owner === undefined ? 0 : owner.settings.waiver_budget_used,
								budget_used_user: user === undefined ? 0 : user.settings.waiver_budget_used,
								trade_deadline: this.state.leagues[i].settings.trade_deadline
							})
							this.setState({
								rosters: rosters,
								info: info
							})
						})
						
						
					})
				}
			})
		})		
	}	

	render() {
		let headshot = allPlayers[this.state.player_id] === undefined ? blankplayer : (allPlayers[this.state.player_id].swish_id !== undefined ? allPlayers[this.state.player_id].swish_id : (allPlayers[this.state.player_id].stats_id !== undefined ? allPlayers[this.state.player_id].stats_id : blankplayer))
		let wins = this.state.info.filter(x => x.owner === this.state.username).reduce((accumlator, current) => accumlator + current.wins, 0) 
		let losses = this.state.info.filter(x => x.owner === this.state.username).reduce((accumlator, current) => accumlator + current.losses, 0)	

		return <div>
			<Link className="link" to="/">Home</Link>
			<Theme/>
			<h1><img src={this.state.avatar}/>{this.state.username}</h1>
			<h2>{this.state.player}</h2>
			<h2><img src={`https://assets1.sportsnet.ca/wp-content/uploads/players/280/${headshot}.png`} /></h2>
			<h3>{this.state.info.filter(x => x.owner === this.state.username).length} Shares ({this.state.leagues.length} Leagues)</h3>
			<h3>2021 Record: {wins} - {losses} <br/> {(wins/(wins + losses)).toFixed(4)}</h3>
			<h3><button onClick={this.toggleOwned}><span className="front">Toggle Owned</span></button>&nbsp;
			<button onClick={this.toggleAvailable}><span className="front">Toggle Available</span></button></h3>
			<h3><input id="bestball" onChange={this.showBestBall} type="checkbox"/>BestBall <input id="standard" onChange={this.showStandard} type="checkbox" />Standard</h3>
			<table className="table">
				<thead>
					<tr>
						<th></th>
						<th>League</th>
						<th>Trade<br/>Deadline</th>
						<th>Owner</th>
						<th>Status</th>
						<th>Current<br/>Record</th>
						<th>Waiver Budget<br/>(Used/Initial)</th>
						<th></th>
					</tr>
				</thead>
				<tbody>	
				{this.state.info.filter(x => x.bestball === 1).sort((a, b) => (a.name > b.name) ? 1 : -1).map(league => 
					<tr key={league.league_id} className={league.owner === this.state.username ? 'bestball owned row' : (league.owner === 'available' ? 'bestball available row' : 'bestball not_owned row')}>
						<td><img src={league.avatar}/></td>
						<td>{league.name} {league.bestball !== 1 ? null : '(bestball)'}</td>
						<td>{league.trade_deadline < 99 ? 'Week ' + league.trade_deadline : null}</td>
						<td>{league.owner}</td>
						<td>{league.status}</td>
						<td>{league.wins + " - " + league.losses}</td>
						<td>{league.owner === 'available' ? `($${league.budget_used_user}/$${league.budget})` : null}</td>
						<td><Link to={'/roster/' + league.league_id + '/' + (league.owner === 'available' ? this.state.username : league.owner)}><button><span className="front">View {league.owner === 'available' ? this.state.username : league.owner} Roster</span></button></Link></td>
					</tr>
				)}
				{this.state.info.filter(x => x.bestball !== 1).sort((a, b) => (a.name > b.name) ? 1 : -1).map(league => 
					<tr key={league.league_id} className={league.owner === this.state.username ? 'standard owned row' : (league.owner === 'available' ? 'standard available row' : 'standard not_owned row')}>
						<td><img src={league.avatar}/></td>
						<td>{league.name} {league.bestball !== 1 ? null : '(bestball)'}</td>
						<td>{league.trade_deadline < 99 ? 'Week ' + league.trade_deadline : null}</td>
						<td>{league.owner}</td>
						<td>{league.status}</td>
						<td>{league.wins + " - " + league.losses}</td>
						<td>{league.owner === 'available' ? `($${league.budget_used_user}/$${league.budget})` : null}</td>
						<td><Link to={'/roster/' + league.league_id + '/' + (league.owner === 'available' ? this.state.username : league.owner)}><button><span className="front">View {league.owner === 'available' ? this.state.username : league.owner} Roster</span></button></Link></td>
					</tr>
				)}
				</tbody>
			</table>
		</div> 
	}
}

export default PlayerSearch;