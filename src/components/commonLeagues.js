import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';

class CommonLeagues extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username1: this.props.match.params.username,
			username2: this.props.match.params.username2,
			avatar1: '',
			avatar2: '',
			user_id1: '',
			user_id2: '',
			leagues1: [],
			leagues2: [],
			leaguesCommon: []
		}
	}



	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username1}`)
		.then(res => {
			this.setState({
				user_id1: res.data.user_id,
				avatar1: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id1}/leagues/nfl/2021`)
			.then(res => {
				this.setState({
					leagues1: res.data
				})
			})
		})
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username2}`) 
		.then(res => {
			this.setState({
				user_id2: res.data.user_id,
				avatar2: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id2}/leagues/nfl/2021`)
			.then(res => {
				this.setState({
					leagues2: res.data.filter(x => this.state.leagues1.map(x => x.league_id).includes(x.league_id))
				})
				for (let i = 0; i < this.state.leagues2.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues2[i].league_id}/rosters`)
					.then(res => {
						let roster1 = res.data.find(x => x.owner_id === this.state.user_id1 || (x.co_owners !== null && x.co_owners.includes(this.state.user_id1)))
						let roster2 = res.data.find(x => x.owner_id === this.state.user_id2 || (x.co_owners !== null && x.co_owners.includes(this.state.user_id2)))
						if (this.state.leagues2[i].previous_league_id !== null && this.state.leagues2[i].previous_league_id.length > 1) {
							axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues2[i].previous_league_id}/winners_bracket`)
							.then(res => {
								let winner = res.data === null ? null : res.data.find(x => x.p === 1).w;
								let second = res.data === null ? null : res.data.find(x => x.p === 1).l;
								let leaguesCommon = this.state.leaguesCommon.concat({
									avatar: this.state.leagues2[i].avatar,
									name: this.state.leagues2[i].name,
									league_id: this.state.leagues2[i].league_id,
									wins1: roster1 === undefined ? null : roster1.settings.wins,
									losses1: roster1 === undefined ? null : roster1.settings.losses,
									pWins1: roster1 === undefined || roster1.metadata === null || roster1.metadata.record === undefined ? null : (roster1.metadata.record.match(/W/g) || []).length,
									pLosses1: roster1 === undefined || roster1.metadata === null || roster1.metadata.record === undefined ? null : (roster1.metadata.record.match(/L/g) || []).length,
									wins2: roster2 === undefined ? null : roster2.settings.wins,
									losses2: roster2 === undefined ? null : roster2.settings.losses,
									pWins2: roster2 === undefined || roster2.metadata === null || roster2.metadata.record === undefined ? null : (roster2.metadata.record.match(/W/g) || []).length,
									pLosses2: roster2 === undefined || roster2.metadata === null || roster2.metadata.record === undefined ? null : (roster2.metadata.record.match(/L/g) || []).length,
									roster_id1: roster1 === undefined ? null : roster1.roster_id,
									roster_id2: roster2 === undefined ? null : roster2.roster_id,
									winner: winner,
									second: second

								})
								this.setState({
									leaguesCommon: leaguesCommon
								})
							})
						}
						else {
								let leaguesCommon = this.state.leaguesCommon.concat({
									avatar: this.state.leagues2[i].avatar,
									name: this.state.leagues2[i].name,
									league_id: this.state.leagues2[i].league_id,
									wins1: roster1 === undefined ? null : roster1.settings.wins,
									losses1: roster1 === undefined ? null : roster1.settings.losses,
									pWins1: roster1 === undefined || roster1.metadata === null || roster1.metadata.record === undefined ? null : (roster1.metadata.record.match(/W/g) || []).length,
									pLosses1: roster1 === undefined || roster1.metadata === null || roster1.metadata.record === undefined ? null : (roster1.metadata.record.match(/L/g) || []).length,
									wins2: roster2 === undefined ? null : roster2.settings.wins,
									losses2: roster2 === undefined ? null : roster2.settings.losses,
									pWins2: roster2 === undefined || roster2.metadata === null || roster2.metadata.record === undefined ? null : (roster2.metadata.record.match(/W/g) || []).length,
									pLosses2: roster2 === undefined || roster2.metadata === null || roster2.metadata.record === undefined ? null : (roster2.metadata.record.match(/L/g) || []).length,
									roster_id1: roster1 === undefined ? null : roster1.roster_id,
									roster_id2: roster2 === undefined ? null : roster2.roster_id,
									winner: null,
									second: null

								})
								this.setState({
									leaguesCommon: leaguesCommon
								})

							}

							
						
					})
					
				}
			})
			
		})
			
	}

	render() {
		return <>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1>Common Leagues</h1>
			<h1><img src={this.state.avatar1}/>{this.state.username1 + " & " + this.state.username2}<img src={this.state.avatar2} /></h1>
			<h3>{this.state.leaguesCommon.length} Leagues</h3>
			<table style={{ margin: 'auto', width: '50%', height: '20%', paddingBottom: '50px' }}>
				<tr>
					<th></th>
					<th>{this.state.username1}</th>
					<th>{this.state.username2}</th>
				</tr>	
				<tr className="row">
					<td>2021 Record:</td>
					<td>{this.state.leaguesCommon.reduce((accumlator, current) => accumlator + current.wins1, 0)} - {this.state.leaguesCommon.reduce((accumlator, current) => accumlator + current.losses1, 0)}</td>
					<td>{this.state.leaguesCommon.reduce((accumlator, current) => accumlator + current.wins2, 0)} - {this.state.leaguesCommon.reduce((accumlator, current) => accumlator + current.losses2, 0)}</td>
				</tr>
				<tr className="row">
					<td>2020 Record</td> 
					<td>1st {this.state.leaguesCommon.filter(x => x.roster_id1 === x.winner).length}<br/>2nd {this.state.leaguesCommon.filter(x => x.roster_id1 === x.second).length}</td>
					<td>1st {this.state.leaguesCommon.filter(x => x.roster_id2 === x.winner).length}<br/>2nd {this.state.leaguesCommon.filter(x => x.roster_id2 === x.second).length}</td>
				</tr>
			</table>			
			<table>
				<thead>
					<tr>
						<th></th>
						<th>League</th>
						<th>{this.state.username1}<br/>2021 Record</th>
						<th>{this.state.username1}<br/>2020 Record</th>
						<th></th>
						<th>{this.state.username2}<br/>2021 Record</th>
						<th>{this.state.username2}<br/>2020 Record</th>
					</tr>
				</thead>
				<tbody>
				{this.state.leaguesCommon.map(league => 
					<tr key={league.league_id} className="row">
						<td><img src={league.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${league.avatar}`}/></td>
						<td>{league.name}</td>
						<td>{league.wins1} - {league.losses1}</td>
						<td>{league.pWins1} - {league.pLosses1} {league.roster_id1 === league.winner ? 'Champ' : (league.roster_id1 === league.second ? 'Runner Up' : null)}</td>
						<td><Link to={'/roster/' + league.league_id + '/' + this.state.username1}><button><span className="front">View {this.state.username1} roster</span></button></Link></td>
						<td>{league.wins2} - {league.losses2}</td>
						<td>{league.pWins2} - {league.pLosses2} {league.roster_id2 === league.winner ? 'Champ' : (league.roster_id2 === league.second ? 'Runner Up' : null)}</td>
						<td><Link to={'/roster/' + league.league_id + '/' + this.state.username2}><button><span className="front">View {this.state.username2} roster</span></button></Link></td>
					</tr>
				)}
				</tbody>
			</table>
		</>
	}
}

export default CommonLeagues;