import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./homepage.css";
import Theme from './theme';
import allPlayers from '../allplayers.json';
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
			espnPlayer: '',
			weather: []
		}
	}

	componentDidMount() {
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

		fetch('/weather')
		.then(res => res.json()).then(data => {
			let weather = data.weather
			this.setState({
				weather: weather
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
							let starters = this.state.players.concat(matchup === undefined ? null : matchup.starters.filter(x => x !== '0'))
							let opponent = res.data.find(x => x !== undefined && matchup !== undefined && x.matchup_id === matchup.matchup_id && x.roster_id !== rid)
							let oppStarters = this.state.oppPlayers.concat(opponent === undefined ? null : opponent.starters.filter(x => x !== '0'))
							const findOccurences = (players = [], type) => {
									const res = [];
									players.forEach(el => {
										const index = res.findIndex(obj => {
											return obj['name'] === el;
										});
										if (index === -1) {
											res.push({
												"name": el,
												[type]: 1
												
 											})
										}
										
										else {
											res[index][type]++;
										};
									});
									return res;
								};
							this.setState({
								players: starters,
								oppPlayers: oppStarters,
								playersDict: findOccurences(starters, 'count'),
								oppPlayersDict: findOccurences(oppStarters, 'count2')
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
			let b = a === undefined ? {name: oppPlayersDict[i].name, count: 0, count2: oppPlayersDict[i].count2} : null
			if(b !== null) {
				allDict.push(b)
			}
		}
		
		for (let i = 0; i < allDict.length; i++) {
			let p = this.state.projections.find(x => allPlayers[allDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[allDict[i].name].search_full_name)
			let inj = this.state.injuries.find(x => allPlayers[allDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[allDict[i].name].search_full_name)
			let hteam = allPlayers[allDict[i].name] === undefined ? null : allPlayers[allDict[i].name].team
			let forecast = this.state.weather.find(x => x.homeTeam === teams[hteam] || (p !== undefined && x.homeTeam === teams[p.opponent]))
			allDict[i].forecast = forecast === undefined ? null : forecast.forecast + " " + forecast.wind.split(' ')[0].replace('m', 'mph')
			allDict[i].status = inj === undefined ? null : inj.status 
			allDict[i].projection = p === undefined ? '0' : p.projection
			allDict[i].opponent = p === undefined ? '-' : p.opponent
		}

		return <>
				<Link to="/" className="link">Home</Link>
				<Theme/>
				<h1>Matchups</h1>
				<h2>{this.state.username} Week {this.state.week}</h2>
				<h3><img style={{ margin: 'auto', width: '8em' }} src={this.state.avatar}/></h3>
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
									<th>Player</th>
									<th>Projection</th>
									<th>Opponent</th>
									<th>Forecast</th>
									<th>Starting</th>
									<th>Opposing</th>
								</tr>
								{allDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(player =>
									<tr className="row">
										<td>{allPlayers[player.name] === undefined ? player.name : (allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team)}
											&nbsp;{player.status === null ? null : '(' + player.status + ')'}
										</td>
										<td>{player.projection} points</td>
										<td>{player.opponent}</td>
										<td>{player.forecast}</td>
										<td>{player.count}</td>
										<td>({player.count2})</td>
									</tr>
									)}
							</table>
						</td>
					</tr>
				</table>

			</>
	}
}

export default Matchups;