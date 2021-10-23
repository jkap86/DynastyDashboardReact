import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./matchups.css";
import Theme from './theme';
import allPlayers from '../allplayers.json';
import blankplayer from '../blankplayer.jpeg';
import axios from 'axios';


const teams = {
			ARI: 'Cardinals',
			ATL: 'Falcons',
			BAL: 'Ravens',
			BUF: 'Bills',
			CAR: 'Panthers',
			CHI: 'Bears',
			CIN: 'Bengals',
			CLE: 'Browns',
			DAL: 'Cowboys',
			DEN: 'Broncos',
			DET: 'Lions',
			GB: 'Packers',
			HOU: 'Texans',
			IND: 'Colts',
			JAC: 'Jaguars',
			JAX: 'Jaguars',
			KC: 'Chiefs',
			LA: 'Rams',
			LAC: 'Chargers',
			LAR: 'Rams',
			MIA: 'Dolphins',
			MIN: 'Vikings',
			NE: 'Patriots',
			NO: 'Saints',
			NYG: 'Giants',
			NYJ: 'Jets',
			LV: 'Raiders',
			PHI: 'Eagles',
			PIT: 'Steelers',
			SEA: 'Seahawks',
			SF: '49ers',
			TB: 'Buccaneers',
			TEN: 'Titans',
			WAS: 'Washington',
			WSH: 'Washington'
		}

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
			oppPlayersDict: [],
			projections: [],
			injuries: [],
			avatar: '',
			weather: [],
			playerStats: [],
			sortBy: 'count'
		}
		this.expandPlayer = this.expandPlayer.bind(this)
		this.sortByOpposing = this.sortByOpposing.bind(this)
		this.sortByStarting = this.sortByStarting.bind(this)
		this.sortByProjection = this.sortByProjection.bind(this)
		this.sortByOpponent = this.sortByOpponent.bind(this)
	}

	sortByOpposing() {
		this.setState({
			sortBy: 'count2'
		})
	}

	sortByStarting() {
		this.setState({
			sortBy: 'count'
		})
	}

	sortByProjection() {
		this.setState({
			sortBy: 'projection'
		})
	}

	sortByOpponent() {
		this.setState({
			sortBy: 'opponent'
		})
	}

 	expandPlayer(e) {
 		let players = document.getElementsByClassName("player-row")
 		for (let i = 0; i < players.length; i++) {
 			players[i].addEventListener("click", function() {
 				this.classList.toggle("active");
 				let panel = this.nextSibling;
 				if (panel.style.display !== 'none') {
 					panel.style.display = 'none'
 				}
 				else {
 					panel.style.display = 'table-row'
 				}
 			})
 		}
 	}

	componentDidMount() {
		fetch(`/stats/${this.state.week}`)
		.then(res => res.json()).then(data => {
			let players = data.stats
			this.setState({
				playerStats: players
			})
		})

		fetch('/injuries')
		.then(res => res.json()).then(data => {
			let players = data.player
			this.setState({
				injuries: players
			})
		})

		fetch('/projectedpoints')
		.then(res => res.json()).then(data => {
			let players = data.points
			this.setState({
				projections: players
			})
		})

		fetch(`/weather/${this.state.week}`)
		.then(res => res.json()).then(data => {
			let weather = data.weather
			this.setState({
				weather: weather
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
			const userID = res.data.user_id
			this.setState({
				user_id: userID,
				avatar: `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`

			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				let leagues = res.data.filter(x => x.settings.best_ball !== 1)
				for (let i = 0; i < leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${leagues[i].league_id}/rosters`)
					.then(res => {
						let rid = res.data.find(x => x.owner_id === this.state.user_id) === undefined ? null : res.data.find(x => x.owner_id === this.state.user_id).roster_id
						axios.get(`https://api.sleeper.app/v1/league/${leagues[i].league_id}/matchups/${this.state.week}`)
						.then(res => {
							let matchup = res.data.find(x => x.roster_id === rid || (x.co_owners !== undefined && x.co_owners.includes(x.roster_id)))
							
							let starters = this.state.players.concat(matchup === undefined ? null : matchup.starters.filter(x => x !== '0').map(x => { return {id: x, league: leagues[i].name}}))


							let opponent = res.data.find(x => x !== undefined && matchup !== undefined && x.matchup_id === matchup.matchup_id && x.roster_id !== rid)
							let oppStarters = this.state.oppPlayers.concat(opponent === undefined ? null : opponent.starters.filter(x => x !== '0').map(x => { return {id: x, league: leagues[i].name}}))
							const findOccurences = (players = [], type, type2) => {
									const res = [];
									players.forEach(el => {
										const index = res.findIndex(obj => {
											if (el !== null) {
												return obj['name'] === el.id
											}
											else {
												return obj['name'] === null
											}
											
										});
										if (index === -1 && el !== null) {
											res.push({
												"name": el.id,
												[type2]: [el.league],
												[type]: 1
 											})
										}
										else if (index === -1 && el === null) {
											res.push({
												"name": null,
												[type2]: [],
												[type]: 1
											})
										}
										
										else {
											res[index][type]++;
											res[index][type2].push(el === null ? null : el.league)
											
										};
									});
									return res;
								};
							this.setState({
								players: starters,
								oppPlayers: oppStarters,
								playersDict: findOccurences(starters, 'count', 'leagues'),
								oppPlayersDict: findOccurences(oppStarters, 'count2', 'leaguesAgainst')
							})

						})
					})
				}
			})
		})

	}

	render() {
		
		let oppPlayersDict = this.state.oppPlayersDict;
		let playersDict = this.state.playersDict;

		let allDict = []
		for (let i = 0; i < playersDict.length; i++) {
			let a = oppPlayersDict.find(x => x.name === playersDict[i].name)
			let b = a === undefined ? null : a.count2
			let c = b === null ? Object.assign({}, playersDict[i], {name: playersDict[i].name, count2: 0}) : Object.assign({}, playersDict[i], a)
			allDict.push(c)
		}
		for (let i = 0; i < oppPlayersDict.length; i++) {
			let a = playersDict.find(x => x.name === oppPlayersDict[i].name)
			let b = a === undefined ? {name: oppPlayersDict[i].name, count: 0, count2: oppPlayersDict[i].count2, leaguesAgainst: oppPlayersDict[i].leaguesAgainst} : null
			if(b !== null) {
				allDict.push(b)
			}
		}
		
		for (let i = 0; i < allDict.length; i++) {
			let p = this.state.projections.find(x => allPlayers[allDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[allDict[i].name].search_full_name)
			let inj = this.state.injuries.find(x => allPlayers[allDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[allDict[i].name].search_full_name && x.position === allPlayers[allDict[i].name].position)
			let team = allPlayers[allDict[i].name] === undefined ? null : allPlayers[allDict[i].name].team
			let forecast = this.state.weather.find(x => x.homeTeam === teams[team] || (p !== undefined && x.homeTeam === teams[p.opponent]))
			let photo = allPlayers[allDict[i].name] === undefined ? blankplayer : allPlayers[allDict[i].name].swish_id === null ? (allPlayers[allDict[i].name].stats_id === null ? blankplayer : allPlayers[allDict[i].name].stats_id) : allPlayers[allDict[i].name].swish_id
			let stats = this.state.playerStats.find(x => allPlayers[allDict[i].name] !== undefined && Number(x.id) === allPlayers[allDict[i].name].fantasy_data_id)
			stats = stats !== undefined ? stats : this.state.playerStats.find(x => allPlayers[allDict[i].name] !== undefined && x.searchName === allPlayers[allDict[i].name].search_full_name)
			allDict[i].forecast = forecast === undefined ? null : forecast.forecast + " " + forecast.wind.split(' ')[0].replace('m', 'mph')
			allDict[i].status = inj === undefined ? null : inj.status 
			allDict[i].projection = p === undefined ? '0' : Number(p.projection)
			allDict[i].rank = p === undefined ? null : allPlayers[allDict[i].name] === undefined ? null : allPlayers[allDict[i].name].position + p.rank
			allDict[i].opponent = p === undefined ? '-' : (forecast !== undefined && teams[p.opponent] === forecast.homeTeam ? `@${p.opponent}` : p.opponent)
			allDict[i].photo = photo === blankplayer ? blankplayer : `https://assets1.sportsnet.ca/wp-content/uploads/players/280/${photo}.png`
			allDict[i].c_a = stats === undefined ? null : (stats.c_a === '0/0' ? null : stats.c_a)
			allDict[i].passYds = stats === undefined ? null : (stats.passYds === '0' ? null : stats.passYds)
			allDict[i].passTD = stats === undefined ? null : (stats.passTD === '0' ? null : stats.passTD)
			allDict[i].passInt = stats === undefined ? null : (stats.passInt === '0' ? null : stats.passInt)
			allDict[i].rushes = stats === undefined ? null : (stats.rushes === '0' ? null : stats.rushes)
			allDict[i].rushYds = stats === undefined ? null : (stats.rushYds === '0' ? null : stats.rushYds)
			allDict[i].rushTD = stats === undefined ? null : (stats.rushTD === '0' ? null : stats.rushTD)
			allDict[i].rec = stats === undefined ? null : (stats.rec === '0' ? null : stats.rec)
			allDict[i].targets = stats === undefined ? null : (stats.targets === '0' ? null : stats.targets)
			allDict[i].recYds = stats === undefined ? null : (stats.recYds === '0' ? null : stats.recYds)
			allDict[i].recTD = stats === undefined ? null : (stats.recTD === '0' ? null : stats.recTD)
		}

		return <>
				<Link to="/" className="link">Home</Link>
				<Theme/>
				<h1>Matchups</h1>
				<h2>{this.state.username} Week {this.state.week}</h2>
				<h3><img style={{ margin: 'auto', width: '8em' }} src={this.state.avatar}/></h3>
				<h3>{allDict.filter(x => (x.status === 'Out' || x.status === 'Injured Reserve') && Number(x.count) > 0).length} Inactives</h3>
				<table style={{  margin: 'auto', width: '75%'}}>
					<tr>
						<th style={{ textAlign: 'center'}}>
							Starters: {allDict.reduce((accumulator, current) => accumulator + (current.projection * current.count), 0).toLocaleString("en-US")} points - {allDict.reduce((accumulator, current) => accumulator + current.count, 0).toLocaleString("en-US")} players
							<br/>
							Opponent Starters: {allDict.reduce((accumulator, current) => accumulator + (current.projection * current.count2), 0).toLocaleString("en-US")} points - {allDict.reduce((accumulator, current) => accumulator + current.count2, 0).toLocaleString("en-US")} players
						</th>
					</tr>
					<tr style={{ verticalAlign: 'top'}}>
						<td>
							<table className="table">
								<tr>
									<th></th>
									<th>Player</th>
									<th style={{ cursor: 'pointer' }} name='opponent' onClick={this.sortByOpponent}>Opponent</th>
									<th style={{ cursor: 'pointer' }} name='projection' onClick={this.sortByProjection}>Projection</th>
									<th>Rank</th>
									<th>Forecast</th>
									<th style={{ cursor: 'pointer' }} name='count' onClick={this.sortByStarting}>Starting</th>
									<th style={{ cursor: 'pointer' }} name='count2' onClick={this.sortByOpposing}>Opposing</th>
								</tr>
								{allDict.sort((a, b) => a[this.state.sortBy] < b[this.state.sortBy] ? 1 : -1).map(player =>
									<>
									<tr className={"player-row " + player.status} id={player.name} style={{  borderSpacing: '4em' }}>
										<td style={{ paddingLeft: '1em' }}><img style={{ width: '2.5em' }} src={player.photo} /></td>
										<td className="name" onClick={this.expandPlayer} value={player.name}>{allPlayers[player.name] === undefined ? player.name : (allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team)}
											&nbsp;{player.status === null ? null : '(' + player.status + ')'}
											<br/>
											<em style={{ fontSize: '14px' }}>
												{player.c_a}&nbsp;
												{player.passYds === null ? null : player.passYds + ' Yds'}&nbsp;
												{player.passTD === null ? null : player.passTD + ' TD'}&nbsp;
												{player.passInt === null ? null : player.passInt + ' Int'}&nbsp;
												{player.rushes === null ? null : player.rushes + ' Car'}&nbsp;
												{player.rushYds === null ? null : player.rushYds + ' Yds'}&nbsp;
												{player.rushTD === null ? null : player.rushTD + ' TD'}&nbsp;
												{player.rec === null ? null : player.rec + ' Rec'}&nbsp;
												{player.targets === null ? null : player.targets + ' Tgt'}&nbsp;
												{player.recYds === null ? null : player.recYds + ' Yds'}&nbsp;
												{player.recTD === null ? null : player.recTD + ' TD'}&nbsp;
											</em>
										</td>
										<td>{player.opponent}</td>
										<td>{player.projection} points</td>
										<td>{player.rank}</td>
										<td>{player.forecast}</td>
										<td>{player.count}</td>
										<td>({player.count2})</td>
									</tr>
									<tr className={player.name + " panel"} style={{ display: 'none'}}>
										<td></td>
										<td colSpan="7">
											<table style={{ borderSpacing: '4em'}}>
												<tr>
													<td style={{ verticalAlign: 'top' }}>
														<table className="leagues">
															<tr><th>For</th></tr>
															{player.leagues === undefined ? 0 : player.leagues.sort((a, b) => a > b ? 1 : -1).map(l => <tr className="league"><td>{l}</td></tr>)}
														</table>
													</td>
													<td style={{ verticalAlign: 'top' }}>
														<table className="leagues">
															<tr><th>Against</th></tr>
															{player.leaguesAgainst === undefined ? 0 : player.leaguesAgainst.sort((a, b) => a > b ? 1 : -1).map(l => <tr className="league"><td>{l}</td></tr>)}
														</table>
													</td>
												</tr>
											</table>
										</td>
									</tr>
									</>
									)}
							</table>
						</td>
					</tr>
				</table>

			</>
	}
}

export default Matchups;