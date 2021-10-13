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
			previous_league_id: '',
			previous_league_id2: '',
			previous_league_id3: '',
			league_name: '',
			username: this.props.match.params.username,
			user_id: '',
			avatar: '',
			league_avatar: '',
			players: [],
			playerValues: [],
			value: '',
			teams: [],
			record: '',
			starters: [],
			allPlayersSIO: [],
			roster_id: '',
			picks: [],
			rounds: ''
		}
	}

	componentDidMount() {
		fetch('/dynastyvalues')
		.then(res => res.json()).then(data => {
			let players = data.name
			this.setState({
				playerValues: players
			})
		})

		axios.get(`https://api.sportsdata.io/v3/nfl/scores/json/Players?key=d5d541b8c8b14262b069837ff8110635`)
		.then(res => {
			this.setState({
				allPlayersSIO: res.data
			})
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
				league_avatar: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`,
				rounds: res.data.settings.type === 2 ? res.data.settings.draft_rounds : 0
			})
		})
		axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}/rosters`)
		.then(res => {
			let rosters = res.data === null ? [] : res.data;
			for (let i = 0; i < rosters.length; i++) {
				if (rosters[i].owner_id === this.state.user_id && rosters[i].players !== null) {
					let record = rosters[i].settings.wins + " - " + rosters[i].settings.losses
					this.setState({
						record: record,
						players: rosters[i].players,
						starters: rosters[i].starters,
						roster_id: rosters[i].roster_id
					}) 	
				}
				else if (rosters[i].players !== null) {
					axios.get(`https://api.sleeper.app/v1/user/${rosters[i].owner_id}`)
					.then(res => {
						let teams = this.state.teams.concat({
							name: res.data.display_name,
							avatar: `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`,
							players: rosters[i].players,
							record: rosters[i].settings.wins + " - " + rosters[i].settings.losses,
							roster_id: rosters[i].roster_id
						})
						this.setState({
							teams: teams
						})
					})
				}
			}
			axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}/traded_picks`)
			.then(res => {
				let picksFor = res.data.filter(x => x.owner_id === this.state.roster_id && ["2022", "2023", "2024"].includes(x.season))
				let picksAway = res.data.filter(x => x.owner_id !== this.state.roster_id && ["2022", "2023", "2024"].includes(x.season))
				
				let i = 0;
				while (i < 1) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}`)
					.then(res => {
						this.setState({
							previous_league_id: res.data.previous_league_id
						})
					})
					if (this.state.previous_league_id.length > 1) {
						axios.get(`https://api.sleeper.app/v1/league/${this.state.previous_league_id}/traded_picks`)
						.then(res => {
							picksFor = picksFor.concat(res.data.filter(x => x.owner_id === this.state.roster_id && ["2022", "2023", "2024"].includes(x.season)))
							picksAway = picksAway.concat(res.data.filter(x => x.previous_owner_id === this.state.roster_id && ["2022", "2023", "2024"].includes(x.season)))
						})
					}
					else {
						i = i + 1
					}
				}
				
					
				let allPicks = []
				let allPicks2 = []
				for (let i = 1; i <= this.state.rounds; i++) {
					allPicks.push({
						season: '2022',
						round: i,
						roster_id: this.state.roster_id,
						owner_id: this.state.roster_id,
						previous_owner_id: this.state.roster_id
					})
					allPicks.push({
						season: '2023',
						round: i,
						roster_id: this.state.roster_id,
						owner_id: this.state.roster_id,
						previous_owner_id: this.state.roster_id
					})
					allPicks.push({
						season: '2024',
						round: i,
						roster_id: this.state.roster_id,
						owner_id: this.state.roster_id,
						previous_owner_id: this.state.roster_id
					})
				}
				for (let i = 0; i < picksFor.length; i++) {
					allPicks.push(picksFor[i])
				}
				for (let i = 0; i < allPicks.length; i++) {
					let a = picksAway.find(x => x.round === allPicks[i].round && x.roster_id === allPicks[i].roster_id && x.season === allPicks[i].season)
					if (a === undefined) {
						allPicks2.push(allPicks[i])
					}
				}

				this.setState({
					picks: allPicks2
				})

			})
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

		let allPlayersSIO = this.state.allPlayersSIO;
		for (let i = 0; i < players.length; i++) {
			let a = allPlayersSIO.find(x => x.YahooPlayerID === allPlayers[players[i]].yahoo_id)
			allPlayers[players[i]].picture = a === undefined ? null : a.PhotoUrl.replace('/', '')
		}


		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<table style={{ height: "initial"}} className="heading-table">
			<tr>
				{this.state.teams.sort((a, b) => a.teamValue < b.teamValue ? 1 : -1).map(team =>
					<td>
						<img src={team.avatar} />
						<ul>
							<li>{team.name}</li> 
							<li>{team.record}</li>
							<li>{team.players.reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</li>
						</ul>
					</td>
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
			<table className="table">
				<thead>
					<tr>
						<th></th>
						<th>Position</th>
						<th>Player</th>
						<th>College</th>
						<th>Age</th>
						<th>Years Exp</th>
						<th>Dynasty Value</th>
					</tr>
				</thead>
				<tbody>
				<tr><th colspan="7">Starters</th></tr>
				{players.filter(x => this.state.starters.includes(x)).map(player => 
					<tr key={player} className="row">
						<td><img src={allPlayers[player].picture}/></td>
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number} {allPlayers[player].first_name} {allPlayers[player].last_name} {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				<tr><th colspan="7">Bench</th></tr>
				{players.filter(x => !this.state.starters.includes(x)).map(player => 
					<tr key={player} className="row">
						<td><img src={allPlayers[player].picture}/></td>
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number} {allPlayers[player].first_name} {allPlayers[player].last_name} {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				<tr><th colspan="7" style={{  textAlign: 'center'  }}>Picks</th></tr>
				<tr>
					<td></td>
					<td></td>
					<td style={{ verticalAlign: 'top'}}>
						<ol style={{ display: 'grid' }}>
							{this.state.picks.sort((a, b) => a.round < b.round ? 1 : -1).sort((a, b) => a.season > b.season ? 1 : -1).filter(x => x.season === "2022").map(pick => 
								<tr className="row"><td>{pick.season + " Round " + pick.round + " " + (this.state.teams.find(x => x.roster_id === pick.roster_id) === undefined ? '' : "(" + this.state.teams.find(x => x.roster_id === pick.roster_id).name + ")")}</td></tr>
							)}
						</ol>
					</td>
					<td style={{ verticalAlign: 'top'}}>
						<ol style={{ display: 'grid' }}>
							{this.state.picks.sort((a, b) => a.round < b.round ? 1 : -1).sort((a, b) => a.season > b.season ? 1 : -1).filter(x => x.season === "2023").map(pick => 
								<tr className="row"><td>{pick.season + " Round " + pick.round + " " + (this.state.teams.find(x => x.roster_id === pick.roster_id) === undefined ? '' : "(" + this.state.teams.find(x => x.roster_id === pick.roster_id).name + ")")}</td></tr>
							)}
						</ol>
					</td>
					<td style={{ verticalAlign: 'top'}}>
						<ol style={{ display: 'grid'  }}>
							{this.state.picks.sort((a, b) => a.round < b.round ? 1 : -1).sort((a, b) => a.season > b.season ? 1 : -1).filter(x => x.season === "2024").map(pick => 
								<tr className="row"><td>{pick.season + " Round " + pick.round + " " + (this.state.teams.find(x => x.roster_id === pick.roster_id) === undefined ? '' : "(" + this.state.teams.find(x => x.roster_id === pick.roster_id).name + ")")}</td></tr>
							)}
						</ol>
					</td>
				</tr>	
				</tbody>
			</table>
			
			<table>
				
			</table>
		</div>
	}
}

export default Roster;