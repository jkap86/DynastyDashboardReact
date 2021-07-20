import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import allPlayers from '../allplayers.json';
import { Link } from 'react-router-dom';

class PlayerSearch extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username,
			player: this.props.match.params.player,
			user_id: '',
			player_id: '',
			leagues: [],
			rosters: [],
			info: [],
			players: []
		}
		this.toggleOwned = this.toggleOwned.bind(this);
		this.toggleAvailable = this.toggleAvailable.bind(this);
	}

	toggleOwned() {
		let not_owned = document.getElementsByClassName("not_owned");
		let available = document.getElementsByClassName("available");
		if (not_owned[0].style.display === "none") {
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
		if (owned[0].style.display === "none") {
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

	componentDidMount() {
		let keys = Object.keys(allPlayers);
		for (let i = 0; i < keys.length; i++) {
			if ((allPlayers[keys[i]].first_name + " " + allPlayers[keys[i]].last_name + " " + allPlayers[keys[i]].position + " " + allPlayers[keys[i]].team) === this.state.player)  {
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
				user_id: user_id
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
						let ownerID = owner === undefined ? 'available' : owner.owner_id
						let wins = owner === undefined ? 0 : owner.settings.wins
						let losses = owner === undefined ? 0 : owner.settings.losses
						axios.get(`https://api.sleeper.app/v1/user/${ownerID}`)
						.then(res =>{
							let ownerName = res.data.username
							let info = this.state.info.concat({
								name: this.state.leagues[i].name,
								owner: ownerName,
								wins: wins,
								losses: losses,
								pwins: owner === undefined || owner.metadata === null || owner.metadata.record === undefined ? 0 : (owner.metadata.record.match(/W/g) || []).length,
								plosses: owner === undefined || owner.metadata === null || owner.metadata.record === undefined ? 0 : (owner.metadata.record.match(/L/g) || []).length
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
		return <div>
			<Link className="link" to="/">Home</Link>
			<Theme/>
			<h1>{this.state.username}</h1>
			<h2>{this.state.player}</h2>
			<h3>{this.state.info.filter(x => x.owner === this.state.username).length} Shares</h3>
			<h3>{this.state.info.filter(x => x.owner === this.state.username).reduce((accumlator, current) => accumlator + current.pwins, 0) + " - " + this.state.info.filter(x => x.owner === this.state.username).reduce((accumlator, current) => accumlator + current.plosses, 0)}</h3>
			<h3><button onClick={this.toggleOwned}><span className="front">Toggle Owned</span></button>&nbsp;
			<button onClick={this.toggleAvailable}><span className="front">Toggle Available</span></button></h3>
			<table>	
				{this.state.info.map(league => 
					<tr className={league.owner === this.state.username ? 'owned' : (league.owner === 'available' ? 'available' : 'not_owned')}>
						<td>{league.name}</td>
						<td>{league.owner}</td>
						<td>{league.wins + " - " + league.losses}</td>
						<td>{league.pwins + " - " + league.plosses}</td>
					</tr>
				)}
			</table>
		</div> 
	}
}

export default PlayerSearch;