import React, { Component } from 'react';
import Theme from './theme';
import axios from 'axios';
import blankplayer from '../blankplayer.jpeg';
import './leagues.css';
import { Link } from 'react-router-dom';

class Leagues extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username,
			leagues: [],
			user_id: '',
			roster: '',
			avatar: '',
			rosterp: ''
		}
	}



	componentWillMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			const userID = res.data.user_id
			const avatar = res.data.avatar
			this.setState({
				user_id: userID,
				avatar: `https://sleepercdn.com/avatars/thumbs/${avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				for (let i = 0; i < res.data.length; i++) {
					let leagues = res.data;
					axios.get(`https://api.sleeper.app/v1/league/${leagues[i].league_id}/rosters`)
					.then(res => {
						let roster = res.data.find(x => x.owner_id === this.state.user_id || (x.co_owners !== null && x.co_owners.includes(this.state.user_id)))
						axios.get(`https://api.sleeper.app/v1/league/${leagues[i].previous_league_id}/rosters`)
						.then(res => {
							let rosterp = res.data === null ? null : res.data.find(x => x.owner_id === this.state.user_id)

						})
						axios.get(`https://api.sleeper.app/v1/league/${leagues[i].previous_league_id}/winners_bracket`)
						.then(res => {
							let winner = res.data === null ? null : res.data.find(x => x.p === 1).w
							let second = res.data === null ? null : res.data.find(x => x.p === 1).l
								let leagues2 = this.state.leagues.concat({
									name: leagues[i].name,
									avatar: leagues[i].avatar,
									roster_id:  roster === undefined ? 0 : roster.roster_id,
									best_ball: leagues[i].settings.best_ball,
									wins: roster === undefined || roster.settings === undefined ? 0 : roster.settings.wins,
									losses: roster === undefined || roster.settings === undefined ? 0 : roster.settings.losses,
									league_id: leagues[i].league_id,
									fpts: roster === undefined || roster.settings === undefined ? 0 : roster.settings.fpts,
									fpts_decimal: roster === undefined || roster.settings === undefined ? 0 : roster.settings.fpts_decimal,
									fpts_against: roster === undefined || roster.settings === undefined || roster.settings.fpts_against === undefined ? 0 : roster.settings.fpts_against,
									pwins: roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? 0 : (roster.metadata.record.match(/W/g) || []).length,
									plosses: roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? 0 : (roster.metadata.record.match(/L/g) || []).length,
									winner: winner,
									second: second,
									spots: leagues[i].roster_positions.filter(x => x !== 'BN').length,
									starters: roster === undefined ? 0 : roster.starters.filter(x => x !== '0').length

								})
								this.setState({
									leagues: leagues2
								})
							})
							
							.then()
								if (leagues[i].previous_league_id === null || leagues[i].previous_league_id.length < 2) {
									let leagues2 = this.state.leagues.concat({
										name: leagues[i].name,
										avatar: leagues[i].avatar,
										roster_id:  roster === undefined ? 0 : roster.roster_id,
										best_ball: leagues[i].settings.best_ball,
										wins: roster === undefined || roster.settings === undefined ? 0 : roster.settings.wins,
										losses: roster === undefined || roster.settings === undefined ? 0 : roster.settings.losses,
										league_id: leagues[i].league_id,
										fpts: roster === undefined || roster.settings === undefined ? 0 : roster.settings.fpts,
										fpts_against: roster === undefined || roster.settings === undefined || roster.settings.fpts_against === undefined ? 0 : roster.settings.fpts_against,
										pwins: roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? 0 : (roster.metadata.record.match(/W/g) || []).length,
										plosses: roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? 0 : (roster.metadata.record.match(/L/g) || []).length,
										winner: null,
										second: null,
										spots: leagues[i].roster_positions === null ? null : leagues[i].roster_positions.filter(x => x !== 'BN').length,
										starters: roster === undefined ? 0 : roster.starters.filter(x => x !== '0').length
									})
									this.setState({
										leagues: leagues2
									})
								}
							})
				}
			})
		})
		
	}

	render() {
		let record = this.state.leagues.reduce((accumulator, current) => accumulator + current.wins, 0) + "-" + this.state.leagues.reduce((accumulator, current) => accumulator + current.losses, 0);
		let bbRecord = this.state.leagues.filter(x => x.best_ball === 1).reduce((accumulator, current) => accumulator + current.wins, 0) + "-" + this.state.leagues.filter(x => x.best_ball === 1).reduce((accumulator, current) => accumulator + current.losses, 0)
		let pRecord = this.state.leagues.reduce((accumulator, current) => accumulator + current.pwins, 0) + "-" + this.state.leagues.reduce((accumulator, current) => accumulator + current.plosses, 0);
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1><img src={this.state.avatar} />{this.state.username}</h1>
			<h2>
			<table className="heading-table">
			<tr className="row">
				<td>2021 Record:</td>
				<td>{record}</td>
				<td>({bbRecord} BestBall)</td>
			</tr>
			<tr className="row">
				<td>2021 PF-PA:</td>
				<td>
					{this.state.leagues.reduce((accumulator, current) => accumulator + current.fpts, 0).toLocaleString("en-US")}- 
					{this.state.leagues.reduce((accumulator, current) => accumulator + current.fpts_against, 0).toLocaleString("en-US")}
				</td>
				<td>
				 	({this.state.leagues.filter(x => x.best_ball === 1).reduce((accumulator, current) => accumulator + current.fpts, 0).toLocaleString("en-US")}-
					{this.state.leagues.filter(x => x.best_ball === 1).reduce((accumulator, current) => accumulator + current.fpts_against, 0).toLocaleString("en-US")} BestBall)
				</td>
			</tr>
			<tr className="row">
				<td>2020 Finishes:</td> 
				<td>1st {this.state.leagues.filter(x => x.winner === x.roster_id).length}</td> 
				<td>2nd {this.state.leagues.filter(x => x.second === x.roster_id).length}</td>
			</tr>
			<tr className="row">
				<td>Total Leagues:</td> 
				<td>{this.state.leagues.length}</td>  
				<td>BestBall: {this.state.leagues.filter(x => x.best_ball === 1).length}</td>
			</tr>
			<tr className="row">{this.state.leagues.filter(x => x.spots !== x.starters && x.best_ball !== 1).length > 0 ? this.state.leagues.filter(x => x.spots !== x.starters && x.best_ball !== 1).length + " Invalid Lineups" : null}</tr > 
			</table>
			</h2>
			<table className="table">
				<thead>
					<tr>
						<th></th>
						<th>League</th>
						<th></th>
						<th>Record</th>
						<th>Fantasy Points</th>
						<th>Fantasy Points Against</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
				{this.state.leagues.filter(x => x.best_ball === 1).sort((a, b) => (a.name > b.name) ? 1 : -1).map(league => 
					<tr key={league.league_id} className="row">
						<td>
							<img src={league.avatar === null ? blankplayer : "https://sleepercdn.com/avatars/thumbs/" + league.avatar} />
						</td>
						<td>
							{league.name}
							<div>{league.spots !== league.starters && (league.best_ball !== 1) ? 'INVALID' : null}</div>
						</td>
						<td>
							{league.roster_id === league.winner ? ' 2020 Champ' : (league.roster_id === league.second ? 'Runner Up' : null)}
						</td>
						<td>
							{league.wins} - {league.losses}
						</td>
						<td>
							{league.fpts} 
						</td>
						<td>
							{league.fpts_against}
						</td>
						<td>
							<Link to={"/roster/" + league.league_id + "/" + this.state.username}><button><span className="front">View Roster</span></button></Link>
						</td>
					</tr>
				)}
				{this.state.leagues.filter(x => x.best_ball !== 1).sort((a, b) => (a.name > b.name) ? 1 : -1).map(league => 
					<tr key={league.league_id} className={"row"}>
						<td>
							<img src={league.avatar === null ? blankplayer : "https://sleepercdn.com/avatars/thumbs/" + league.avatar} />
						</td>
						<td>
							{league.name}
							<div>{league.spots !== league.starters && (league.best_ball !== 1) ? 'INVALID' : null}</div>
						</td>
						<td>
							{league.roster_id === league.winner ? ' 2020 Champ' : (league.roster_id === league.second ? 'Runner Up' : null)}
						</td>
						<td>
							{league.wins} - {league.losses}
						</td>
						<td>
							{league.fpts} 
						</td>
						<td>
							{league.fpts_against}
						</td>
						<td>
							<Link to={"/roster/" + league.league_id + "/" + this.state.username}><button><span className="front">View Roster</span></button></Link>
						</td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
	}	
}

export default Leagues;