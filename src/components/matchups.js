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
							const findOccurences = (players = []) => {
									const res = [];
									players.forEach(el => {
										const index = res.findIndex(obj => {
											return obj['name'] === el;
										});
										if (index === -1) {
											res.push({
												"name": el,
												"count": 1,
												"projection": '0'
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

		for (let i = 0; i < this.state.playersDict.length; i++) {
			let p = this.state.projections.find(x => allPlayers[this.state.playersDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[this.state.playersDict[i].name].search_full_name)
			let inj = this.state.injuries.find(x => allPlayers[this.state.playersDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[this.state.playersDict[i].name].search_full_name)
			let hteam = allPlayers[this.state.playersDict[i].name] === undefined ? null : allPlayers[this.state.playersDict[i].name].team
			let forecast = this.state.weather.find(x => x.homeTeam === teams[hteam] || (p !== undefined && x.homeTeam === teams[p.opponent]))
			this.state.playersDict[i].forecast = forecast === undefined ? null : forecast.forecast + " " + forecast.wind.split(' ')[0].replace('m', 'mph')
			this.state.playersDict[i].status = inj === undefined ? null : inj.status 
			this.state.playersDict[i].projection = p === undefined ? '0' : p.projection
			this.state.playersDict[i].opponent = p === undefined ? '-' : p.opponent
		}

		for (let i = 0; i < this.state.oppPlayersDict.length; i++) {
			let p = this.state.projections.find(x => allPlayers[this.state.oppPlayersDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[this.state.oppPlayersDict[i].name].search_full_name)
			let inj = this.state.injuries.find(x => allPlayers[this.state.oppPlayersDict[i].name] !== undefined && x.searchName.replace('jr', '') === allPlayers[this.state.oppPlayersDict[i].name].search_full_name)
			this.state.oppPlayersDict[i].status = inj === undefined ? null : inj.status
			this.state.oppPlayersDict[i].projection = p === undefined ? '0' : p.projection
			this.state.oppPlayersDict[i].opponent = p === undefined ? '-' : p.opponent
		}

		return <>
				<Link to="/" className="link">Home</Link>
				<Theme/>
				<h1>Matchups</h1>
				<h2>{this.state.username} Week {this.state.week}</h2>
				<h3><img style={{ margin: 'auto', width: '8em' }} src={this.state.avatar}/></h3>
				<table style={{  margin: 'auto', width: '75%'}}>
					<tr>
						<th style={{ textAlign: 'center'}}>Starters: {this.state.playersDict.reduce((accumulator, current) => accumulator + (current.projection * current.count), 0).toLocaleString("en-US")} points - {this.state.playersDict.reduce((accumulator, current) => accumulator + current.count, 0).toLocaleString("en-US")} players</th>
						<th style={{ textAlign: 'center'}}>Opponent Starters: {this.state.oppPlayersDict.reduce((accumulator, current) => accumulator + (current.projection * current.count), 0).toLocaleString("en-US")} points - {this.state.oppPlayersDict.reduce((accumulator, current) => accumulator + current.count, 0).toLocaleString("en-US")} players</th>
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
									<th>(Opposing)</th>
								</tr>
								{this.state.playersDict.sort((a, b) => (a.count < b.count) ? 1 : ((a.projection < b.projection) ? 1 : -1)).map(player => 
									<tr className="row">
										<td>
											{allPlayers[player.name] === undefined ? player.name : (allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team)}
											&nbsp;{player.status === null ? null : '(' + player.status + ')'}
										</td>
										<td>{player.projection} points</td>
										<td>{player.opponent}</td>
										<td>{player.forecast}</td>
										<td>{player.count}</td>
										<td>({this.state.oppPlayersDict.find(x => x.name === player.name) === undefined ? 0 : this.state.oppPlayersDict.find(x => x.name === player.name).count})</td>
									</tr>
									)}
							</table>
						</td>
						<td>
							<table className="table">
								<tr>
									<th>Player</th>
									<th>Projection</th>
									<th>Opponent</th>
									<th>Starting</th>
									<th></th>
								</tr>
								{this.state.oppPlayersDict.sort((a, b) => (a.count < b.count) ? 1 : ((a.projection < b.projection) ? 1 : -1)).map(player =>
									<tr className="row">
										<td>{allPlayers[player.name] === undefined ? player.name : (allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team)}
											&nbsp;{player.status === null ? null : '(' + player.status + ')'}
										</td>
										<td>{player.projection} points</td>
										<td>{player.opponent}</td>
										<td>{player.count}</td>
										<td>({this.state.playersDict.find(x => x.name === player.name) === undefined ? 0 : this.state.playersDict.find(x => x.name === player.name).count})</td>
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