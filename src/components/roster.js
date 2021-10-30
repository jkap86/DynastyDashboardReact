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
			rounds: '',
			picksAway: [],
			picksFor: []
		}

	}
	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.match.params.username !== prevState.username) {
			const currentUsername = nextProps.match.params.username
			window.location.reload();
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
				rounds: res.data.settings.type === 2 ? res.data.settings.draft_rounds : 0,
				previous_league_id: res.data.previous_league_id
			})
		})
		axios.get(`https://api.sleeper.app/v1/league/${this.state.league_id}/rosters`)
		.then(res => {
			let rosters = res.data === null ? [] : res.data;
			let roster = rosters.find(x => x.owner_id === this.state.user_id && x.players !== null)
			let record = (roster === undefined ? 0 : roster.settings.wins) + " - " + (roster === undefined ? 0 : roster.settings.losses)
			this.setState({
				record: record,
				players: roster === undefined ? [] : roster.players,
				starters: roster === undefined ? [] : roster.starters,
				roster_id: roster === undefined ? [] : roster.roster_id,
				reserve: roster === undefined || roster.reserve === null ? [] : roster.reserve,
				taxi: roster === undefined || roster.taxi === null ? [] : roster.taxi
			})


			for (let i = 0; i < rosters.length; i++) {
				if (rosters[i].players !== null && rosters[i].owner_id !== this.state.user_id) {
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
				this.setState({
					picksAway: picksAway,
					picksFor: picksFor
				})

				let i = 0;
				let leagueID = this.state. previous_league_id
				while (i < 1) {
					if (leagueID !== null && leagueID.length > 1) {
						axios.get(`https://api.sleeper.app/v1/league/${leagueID}/traded_picks`)
						.then(res => {
							let pfp = this.state.picksFor.concat(res.data.filter(x => x.owner_id === this.state.roster_id))
							let pap = this.state.picksAway.concat(res.data.filter(x => x.previous_owner_id === this.state.roster_id && x.roster_id === this.state.roster_id))
							this.setState({
								picksFor: pfp,
								picksAway: pap.filter(x => ["2022", "2023", "2024"].includes(x.season))
							})
						})
						axios.get(`https://api.sleeper.app/v1/league/${leagueID}`)
						.then(res => {
							leagueID = this.state.previous_league_id
						})
						i = leagueID.length > 1 ? 1 : 0
						
					}
					else {
						i = 1
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
					let b = allPicks2.find(x => x.round === allPicks[i].round && x.roster_id === allPicks[i].roster_id && x.season === allPicks[i].season)
					if (a === undefined && b === undefined) {
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
		let picks =  this.state.picks
		for (let i = 0; i < picks.length; i++) {
			let p = this.state.playerValues.find(x => x.name.includes(picks[i].season + " Mid " + picks[i].round))
			picks[i].value = p === undefined ? '0' : p.value
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
		
		let map = {"QB": 1, "RB": 2, "WR": 3, "TE": 4}
		let players = this.state.players.sort((a, b) => map[allPlayers[a].position] > map[allPlayers[b].position] ? 1 : -1)

		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<table style={{ height: "initial"}} className="heading-table">
			<tr>
				{this.state.teams.sort((a, b) => a.teamValue < b.teamValue ? 1 : -1).map(team =>
					<td>
						<Link to={"/roster/" + this.state.league_id + "/" + team.name}>
							<img src={team.avatar} />
						</Link>
						<ul>
							<li>{team.name}</li> 
							<li>{team.record}</li>
							<li>{team.players.reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</li>
						</ul>
					</td>
				)}
			</tr>
			</table>
			<h1><img src={this.state.league_avatar}/></h1>
			<h1>{this.state.league_name}</h1>
			<h1><img src={this.state.avatar}/></h1>
			<h1>{this.state.username}</h1>
			<h2>Record: {this.state.record}</h2>
			<h3>
				<ol>
					<li>Players: {value.toLocaleString("en-US")}</li>&nbsp;&nbsp;
					<li>Draft Capital: {picks.reduce((accumulator, current) => accumulator + Number(current.value), 0).toLocaleString("en-US")}</li>&nbsp;&nbsp;
					<li>Total Dynasty Value: {(value + picks.reduce((accumulator, current) => accumulator + Number(current.value), 0)).toLocaleString("en-US")}</li>&nbsp;&nbsp;
				</ol>
			</h3>
			<h3>
				Weighted Ages
				<ol>
					<li>QB: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'QB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'QB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>&nbsp;&nbsp;&nbsp;&nbsp;
					<li>RB: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'RB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'RB').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>&nbsp;&nbsp;&nbsp;&nbsp;
					<li>WR: {Math.round((this.state.players.filter(x => allPlayers[x].position === 'WR').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].age) * Number(allPlayers[current].value)), 0)) / (this.state.players.filter(x => allPlayers[x].position === 'WR').reduce((accumulator, current) => accumulator + (Number(allPlayers[current].value)), 0)) * 100) / 100} yrs</li>&nbsp;&nbsp;&nbsp;&nbsp;
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
						<th>Years<br/>Exp</th>
						<th>Dynasty<br/>Value</th>
					</tr>
				</thead>
				<tbody>
				<tr><th colspan="7" style={{ textAlign: 'center' }}>Starters - {this.state.players.filter(x => this.state.starters.includes(x)).reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</th></tr>
				{players.filter(x => this.state.starters.includes(x)).map(player => 
					<tr key={player} className="row">
						<td><img src={`https://assets1.sportsnet.ca/wp-content/uploads/players/280/${allPlayers[player].swish_id === null ? allPlayers[player].stats_id : allPlayers[player].swish_id}.png`}/></td>
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number} {allPlayers[player].first_name} {allPlayers[player].last_name} {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				<tr><th colspan="7" style={{ textAlign: 'center' }}>Bench - {this.state.players.filter(x => !this.state.starters.includes(x) && !this.state.reserve.includes(x) && !this.state.taxi.includes(x)).reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</th></tr>
				{this.state.players.filter(x => !this.state.starters.includes(x) && !this.state.reserve.includes(x) && !this.state.taxi.includes(x)).map(player => 
					<tr key={player} className="row">
						<td><img src={`https://assets1.sportsnet.ca/wp-content/uploads/players/280/${allPlayers[player].swish_id === null ? allPlayers[player].stats_id : allPlayers[player].swish_id}.png`}/></td>
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number} {allPlayers[player].first_name} {allPlayers[player].last_name} {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				<tr><th colspan="7" style={{ textAlign: 'center' }}>IR - {this.state.players.filter(x => this.state.reserve.includes(x)).reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</th></tr>
				{this.state.players.filter(x => this.state.reserve.includes(x)).map(player => 
					<tr key={player} className="row">
						<td><img src={`https://assets1.sportsnet.ca/wp-content/uploads/players/280/${allPlayers[player].swish_id === null ? allPlayers[player].stats_id : allPlayers[player].swish_id}.png`}/></td>
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number} {allPlayers[player].first_name} {allPlayers[player].last_name} {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				<tr><th colspan="7" style={{ textAlign: 'center' }}>Taxi - {this.state.players.filter(x => this.state.taxi.includes(x)).reduce((accumulator, current) => accumulator + Number(allPlayers[current].value), 0).toLocaleString("en-US")}</th></tr>
				{this.state.players.filter(x => this.state.taxi.includes(x)).map(player => 
					<tr key={player} className="row">
						<td><img src={`https://assets1.sportsnet.ca/wp-content/uploads/players/280/${allPlayers[player].swish_id === null ? allPlayers[player].stats_id : allPlayers[player].swish_id}.png`}/></td>
						<td>{allPlayers[player].position}</td>
						<td>{allPlayers[player].number} {allPlayers[player].first_name} {allPlayers[player].last_name} {allPlayers[player].team === null ? 'FA' : allPlayers[player].team}</td>
						<td>{allPlayers[player].college}</td>
						<td>{allPlayers[player].age}</td>
						<td>{allPlayers[player].years_exp}</td>
						<td>{Number(allPlayers[player].value).toLocaleString("en-US")}</td>
					</tr>
				)}
				<tr><th colspan="7" style={{  textAlign: 'center'  }}>Picks - {picks.reduce((accumulator, current) => accumulator + Number(current.value), 0).toLocaleString("en-US")}</th></tr>
				<tr>
					<td colspan="7">
						<table className="table" style={{ boxShadow: 'none', width: '100%'}}>
							<tr>
								<td style={{ verticalAlign: 'top'}}>
									<table style={{ borderCollapse: 'collapse'}}>
										{picks.sort((a, b) => a.round < b.round ? 1 : -1).sort((a, b) => a.season > b.season ? 1 : -1).filter(x => x.season === "2022").map(pick => 
											<tr className="row"><td style={{ textAlign: 'left' }}>{pick.season + " Round " + pick.round + " " + (this.state.teams.find(x => x.roster_id === pick.roster_id) === undefined ? '' : "(" + this.state.teams.find(x => x.roster_id === pick.roster_id).name + ")")}</td><td>{Number(pick.value).toLocaleString("en-US")}</td></tr>
										)}
									</table>
								</td>
								<td style={{ verticalAlign: 'top'}}>
									<table style={{ borderCollapse: 'collapse'}}>
										{picks.sort((a, b) => a.round < b.round ? 1 : -1).sort((a, b) => a.season > b.season ? 1 : -1).filter(x => x.season === "2023").map(pick => 
											<tr className="row"><td style={{ textAlign: 'left' }}>{pick.season + " Round " + pick.round + " " + (this.state.teams.find(x => x.roster_id === pick.roster_id) === undefined ? '' : "(" + this.state.teams.find(x => x.roster_id === pick.roster_id).name + ")")}</td><td>{Number(pick.value).toLocaleString("en-US")}</td></tr>
										)}
									</table>
								</td>
								<td style={{ verticalAlign: 'top'}}>
									<table style={{ borderCollapse: 'collapse'}}>
										{picks.sort((a, b) => a.round < b.round ? 1 : -1).sort((a, b) => a.season > b.season ? 1 : -1).filter(x => x.season === "2024").map(pick => 
											<tr className="row"><td style={{ textAlign: 'left' }}>{pick.season + " Round " + pick.round + " " + (this.state.teams.find(x => x.roster_id === picks.roster_id) === undefined ? '' : "(" + this.state.teams.find(x => x.roster_id === pick.roster_id).name + ")")}</td><td>{Number(pick.value).toLocaleString("en-US")}</td></tr>
										)}
									</table>
								</td>
							</tr>
						</table>
					</td>	
				</tr>	
				</tbody>
			</table>
		</div>
	}
}

export default Roster;