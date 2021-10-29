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
			sortBy: 'countFor',
			Questionable: true,
			Doubtful: true,
			Out: true,
			Healthy: true,
			InjuredReserve: true,
			filterPos: ['QB', 'FB', 'RB', 'WR', 'TE'],
			filterInj: ['Healthy', 'Questionable', 'Doubtful', 'Out', 'Injured Reserve'],
			allDict: []


		}
		this.expandLeague = this.expandLeague.bind(this)
		this.expandPlayer = this.expandPlayer.bind(this)
		this.sortByOpposing = this.sortByOpposing.bind(this)
		this.sortByStarting = this.sortByStarting.bind(this)
		this.sortByProjection = this.sortByProjection.bind(this)
		this.sortByOpponent = this.sortByOpponent.bind(this)
		this.filterByInjuryStatus = this.filterByInjuryStatus.bind(this)
		this.filterByPosition = this.filterByPosition.bind(this)
		this.getStats = this.getStats.bind(this)
	}

	filterByPosition(e) {
		let position = e.target.name
		let index = this.state.filterPos.indexOf(position)
		let filterPos = this.state.filterPos

		if (index === -1) {
			filterPos.push(position)
			if (position === 'RB') {
				filterPos.push('FB')
			}
			this.setState({
				filterPos: filterPos
			})
		}
		else {
			filterPos.splice(index, 1)
			if (position === 'RB') {
				let index2 = filterPos.indexOf('FB')
				filterPos.splice(index2, 1)
			}
			this.setState({
				filterPos: filterPos
			})
		}
		
	}

	filterByInjuryStatus(e) {
		let injuryStatus = e.target.value
		let index = this.state.filterInj.indexOf(injuryStatus)
		let filterInj = this.state.filterInj

		if (index === -1) {
			filterInj.push(injuryStatus)
			this.setState({
				filterInj: filterInj
			})
		}
		else {
			filterInj.splice(index, 1)
			this.setState({
				filterInj: filterInj
			})
		}
	}

	sortByOpposing() {
		let panels = document.getElementsByClassName("panel")
		for (let i = 0; i < panels.length; i++) {
			panels[i].style.display = 'none'
		}
		this.setState({
			sortBy: 'countAgainst'
		})
	}

	sortByStarting() {
		let panels = document.getElementsByClassName("panel")
		for (let i = 0; i < panels.length; i++) {
			panels[i].style.display = 'none'
		}
		this.setState({
			sortBy: 'countFor'
		})
	}

	sortByProjection() {
		let panels = document.getElementsByClassName("panel")
		for (let i = 0; i < panels.length; i++) {
			panels[i].style.display = 'none'
		}
		this.setState({
			sortBy: 'projection'
		})
	}

	sortByOpponent() {
		let panels = document.getElementsByClassName("panel")
		for (let i = 0; i < panels.length; i++) {
			panels[i].style.display = 'none'
		}
		this.setState({
			sortBy: 'opponent'
		})
	}

	expandLeague(e) {
		let leagues = document.getElementsByClassName("league")
		for (let i = 0; i < leagues.length; i++) {
			leagues[i].addEventListener("click", function() {
				this.classList.toggle("active")
				let lineup = this.nextSibling;
				if(lineup.style.display !== 'none') {
					lineup.style.display = 'none'
				}
				else {
					lineup.style.display = 'table-row'
				}
			})
		}
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

 	getStats() {
 		fetch(`/stats/${this.state.week}`)
		.then(res => res.json()).then(data => {
			let players = data.stats
			this.setState({
				playerStats: players
			})
		})
		fetch(`/matchupsdata/${this.state.week}/${this.state.user_id}`)
		.then(res => res.json()).then(data => {
			let allDict = data.data
			this.setState({
				allDict: allDict
			})
		})
 	}

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			this.setState({
				user_id: res.data.user_id,
				avatar: `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			fetch(`/matchupsdata/${this.state.week}/${this.state.user_id}`)
			.then(res => res.json()).then(data => {
				let allDict = data.data
				this.setState({
					allDict: allDict
				})
			})
		})


		this.getStats();	
		this.interval = setInterval(this.getStats, 10000);
		

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

		

		
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	render() {
		
		let allDict = this.state.allDict.sort((a, b) => a.countFor < b.countFor ? 1 : -1)
		
		
		for (let i = 0; i < allDict.length; i++) {
			let p = this.state.projections.find(x => allPlayers[allDict[i].id] !== undefined && x.searchName.replace('jr', '') === allPlayers[allDict[i].id].search_full_name)
			let inj = this.state.injuries.find(x => allPlayers[allDict[i].id] !== undefined && x.searchName.replace('jr', '') === allPlayers[allDict[i].id].search_full_name && x.position === allPlayers[allDict[i].id].position)
			let team = allPlayers[allDict[i].id] === undefined ? null : allPlayers[allDict[i].id].team
			let forecast = this.state.weather.find(x => x.homeTeam === teams[team] || (p !== undefined && x.homeTeam === teams[p.opponent]))
			let photo = allPlayers[allDict[i].id] === undefined ? blankplayer : allPlayers[allDict[i].id].swish_id === null ? (allPlayers[allDict[i].id].stats_id === null ? blankplayer : allPlayers[allDict[i].id].stats_id) : allPlayers[allDict[i].id].swish_id
			let stats = this.state.playerStats.find(x => allPlayers[allDict[i].id] !== undefined && Number(x.id) === allPlayers[allDict[i].id].fantasy_data_id)
			stats = stats !== undefined ? stats : this.state.playerStats.find(x => allPlayers[allDict[i].id] !== undefined && x.searchName === allPlayers[allDict[i].id].search_full_name)
			allDict[i].forecast = forecast === undefined ? null : forecast.forecast + " " + forecast.wind.split(' ')[0].replace('m', 'mph')
			allDict[i].status = inj === undefined ? 'Healthy' : inj.status 
			allDict[i].projection = p === undefined ? '0' : Number(p.projection)
			allDict[i].rank = p === undefined ? null : allPlayers[allDict[i].id] === undefined ? null : allPlayers[allDict[i].id].position + p.rank
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
			allDict[i].position = allPlayers[allDict[i].id] === undefined ? null : allPlayers[allDict[i].id].position
			
		}

		return <>
				<Link to="/" className="link">Home</Link>
				<Theme/>
				<h1>Matchups {this.state.position}</h1>
				<h2>{this.state.username} Week {this.state.week}</h2>
				<h3><img style={{ margin: 'auto', width: '8em' }} src={this.state.avatar}/></h3>
				<h3>{this.state.allDict.filter(x => (x.status === 'Out' || x.status === 'Injured Reserve') && Number(x.countFor) > 0).length} Inactives</h3>
				<table style={{  margin: 'auto', width: '75%'}}>
					<tr>
						<th style={{ textAlign: 'center'}}>
							Starters: {allDict.filter(x => this.state.filterPos.includes(x.position) && this.state.filterInj.includes(x.status)).reduce((accumulator, current) => accumulator + (current.projection * current.countFor), 0).toLocaleString("en-US")} points - {allDict.filter(x => this.state.filterPos.includes(x.position) && this.state.filterInj.includes(x.status)).reduce((accumulator, current) => accumulator + Number(current.countFor), 0).toLocaleString("en-US")} players
							<br/>
							Opponent Starters: {allDict.filter(x => this.state.filterPos.includes(x.position) && this.state.filterInj.includes(x.status)).reduce((accumulator, current) => accumulator + (current.projection * current.countAgainst), 0).toLocaleString("en-US")} points - {allDict.filter(x => this.state.filterPos.includes(x.position) && this.state.filterInj.includes(x.status)).reduce((accumulator, current) => accumulator + Number(current.countAgainst), 0).toLocaleString("en-US")} players
						</th>
					</tr>
					<tr>
						<td colSpan="8">
							<input onChange={this.filterByPosition} checked={this.state.filterPos.includes("QB")} name="QB" type="checkbox"/><label for="QB">QB</label>
							<input onChange={this.filterByPosition} checked={this.state.filterPos.includes("RB")} name="RB" type="checkbox"/><label for="RB">RB</label>
							<input onChange={this.filterByPosition} checked={this.state.filterPos.includes("WR")} name="WR" type="checkbox"/><label for="WR">WR</label>
							<input onChange={this.filterByPosition} checked={this.state.filterPos.includes("TE")} name="TE" type="checkbox"/><label for="TE">TE</label>
						</td>
					</tr>
					<tr>
						<td colSpan="8">
							<input name="Healthy" value="Healthy" type="checkbox" onChange={this.filterByInjuryStatus} checked={this.state.filterInj.includes('Healthy')}/><label for="Healthy">Healthy</label>
							<input name="Questionable" value="Questionable" type="checkbox" onChange={this.filterByInjuryStatus} checked={this.state.filterInj.includes('Questionable')}/><label for="Questionable">Questionable</label>
							<input name="Doubtful" value="Doubtful" type="checkbox" onChange={this.filterByInjuryStatus} checked={this.state.filterInj.includes('Doubtful')}/><label for="Doubtful">Doubtful</label>
							<input name="Out" value="Out" type="checkbox" onChange={this.filterByInjuryStatus} checked={this.state.filterInj.includes('Out')}/><label for="Out">Out</label>
							<input name="InjuredReserve" value="Injured Reserve" type="checkbox" onChange={this.filterByInjuryStatus} checked={this.state.filterInj.includes('Injured Reserve')}/><label for="injuredreserve">Injured Reserve</label>
						</td>
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
								{this.state.allDict.sort((a, b) => (Number(a[this.state.sortBy]) < Number(b[this.state.sortBy]) ? 1 : -1)).filter(x => this.state.filterPos.includes(x.position)).filter(x => this.state.filterInj.includes(x.status)).map(player =>
									<>
									<tbody onClick={this.expandPlayer} value={player.id} className={player.position + " " + player.status.replace(/ +/g, "")} id={player.id}>
									<tr className="player-row">
										<td style={{ paddingLeft: '1em' }}><img style={{ width: '2.5em' }} src={player.photo} /></td>
										<td className="name">{allPlayers[player.id] === undefined ? player.id : (allPlayers[player.id].position + " " + allPlayers[player.id].first_name + " " + allPlayers[player.id].last_name + " " + allPlayers[player.id].team)}
											&nbsp;{player.status === 'Healthy' ? null : '(' + player.status + ')'}
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
										<td>{Number(player.countFor)}</td>
										<td>({Number(player.countAgainst)})</td>
									</tr>
									<tr className={player.id + " panel "} style={{ display: 'none' }}>
										<td></td>
										<td colSpan="7">
											<table style={{ borderSpacing: '4em'}}>
												<tr>
													<td style={{ verticalAlign: 'top' }}>
														<table className="leagues">
															<tr><th>For</th></tr>
															{player.leaguesFor[0] === undefined ? 0 : player.leaguesFor[0].map(l => 
																<>
																<tr onClick={this.expandLeague} style={{ cursor: 'pointer' }} className="league"><td>{l.league.name}</td><td>{l.league.team_pf}</td><td>{l.league.team_pa}</td></tr>
																<tr className={l.league.name + " lineup"} style={{ display: 'none'}}>
																	<td colSpan="3">
																		<table>
																			<tr>
																				<td>
																					<table className="lineup-table">
																						<tr><th colSpan="2">Starters</th></tr>
																						{l.league.lineupFor.map(lp => 
																							<tr><td>{allPlayers[lp] === undefined ? lp : allPlayers[lp].first_name + " " + allPlayers[lp].last_name}</td><td>{l.league.player_pointsFor[lp]}</td></tr>
																						)}
																						<tr><th colSpan="2">Bench</th></tr>
																						{Object.keys(l.league.player_pointsFor).filter(x => !l.league.lineupFor.includes(x)).map(bp => 
																							<tr><td>{allPlayers[bp] === undefined ? bp : allPlayers[bp].first_name + " " + allPlayers[bp].last_name}</td><td>{l.league.player_pointsFor[bp]}</td></tr>
																						)}
																					</table>
																				</td>
																				<td>
																					<table className="lineup-table">
																						<tr><th colSpan="2">Starters</th></tr>
																						{l.league.lineupAgainst.map(lp => 
																							<tr><td>{allPlayers[lp] === undefined ? lp : allPlayers[lp].first_name + " " + allPlayers[lp].last_name}</td><td>{l.league.player_pointsAgainst[lp]}</td></tr>
																						)}
																						<tr><th colSpan="2">Bench</th></tr>
																						{Object.keys(l.league.player_pointsAgainst).filter(x => !l.league.lineupAgainst.includes(x)).map(bp =>
																							<tr><td>{allPlayers[bp] === undefined ? bp : allPlayers[bp].first_name + " " + allPlayers[bp].last_name}</td><td>{l.league.player_pointsAgainst[bp]}</td></tr>
																						)}
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
													<td style={{ verticalAlign: 'top' }}>
														<table className="leagues">
															<tr><th>Against</th></tr>
															{player.leaguesAgainst[0] === undefined ? 0 : player.leaguesAgainst[0].map(l => 
																<>
																<tr onClick={this.expandLeague} style={{ cursor: 'pointer' }} className="league"><td>{l.league.name}</td><td>{l.league.team_pf}</td><td>{l.league.team_pa}</td></tr>
																<tr className={l.league.name + " lineup"} style={{ display: 'none' }}>
																	<td colSpan="3">
																		<table>
																			<tr>
																				<td>
																					<table className="lineup-table">
																						<tr><th colSpan="2">Starters</th></tr>
																						{l.league.lineupFor.map(lp => 
																							<tr><td>{allPlayers[lp] === undefined ? lp : allPlayers[lp].first_name + " " + allPlayers[lp].last_name}</td><td>{l.league.player_pointsFor[lp]}</td></tr>
																						)}
																						<tr><th colSpan="2">Bench</th></tr>
																						{Object.keys(l.league.player_pointsFor).filter(x => !l.league.lineupFor.includes(x)).map(bp => 
																							<tr><td>{allPlayers[bp] === undefined ? bp : allPlayers[bp].first_name + " " + allPlayers[bp].last_name}</td><td>{l.league.player_pointsFor[bp]}</td></tr>
																						)}
																					</table>
																				</td>
																				<td>
																					<table className="lineup-table">
																						<tr><th colSpan="2">Starters</th></tr>
																						{l.league.lineupAgainst.map(lp => 
																							<tr><td>{allPlayers[lp] === undefined ? lp : allPlayers[lp].first_name + " " + allPlayers[lp].last_name}</td><td>{l.league.player_pointsAgainst[lp]}</td></tr>
																						)}
																						<tr><th colSpan="2">Bench</th></tr>
																						{Object.keys(l.league.player_pointsAgainst).filter(x => !l.league.lineupAgainst.includes(x)).map(bp => 
																							<tr><td>{allPlayers[bp] === undefined ? bp : allPlayers[bp].first_name + " " + allPlayers[bp].last_name}</td><td>{l.league.player_pointsAgainst[bp]}</td></tr>
																						)}
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
										</td>
									</tr>
									</tbody>
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