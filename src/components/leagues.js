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
			avatar: ''
		}
	}

	componentDidMount() {
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
						let roster = res.data.find(x => x.owner_id === this.state.user_id)
						let leagues2 = this.state.leagues.concat({
							name: leagues[i].name,
							avatar: leagues[i].avatar,
							best_ball: leagues[i].settings.best_ball,
							wins: roster === undefined || roster.settings === undefined ? 0 : roster.settings.wins,
							losses: roster === undefined || roster.settings === undefined ? 0 : roster.settings.losses,
							league_id: leagues[i].league_id,
							fpts: roster === undefined || roster.settings === undefined ? 0 : roster.settings.fpts,
							fpts_against: roster === undefined || roster.settings === undefined || roster.settings.fpts_against === undefined ? 0 : roster.settings.fpts_against,
							pwins: roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? 0 : (roster.metadata.record.match(/W/g) || []).length,
							plosses: roster === undefined || roster.metadata === null || roster.metadata.record === undefined ? 0 : (roster.metadata.record.match(/L/g) || []).length
						})
						this.setState({
							roster: roster,
							leagues: leagues2
						})
					})
				}
				
			})
		})
		
	}

	render() {
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1><img src={this.state.avatar} />{this.state.username}</h1>
			<h2>{this.state.leagues.reduce((accumulator, current) => accumulator + current.wins, 0)} - {this.state.leagues.reduce((accumulator, current) => accumulator + current.losses, 0)}</h2>
			<h2>{this.state.leagues.reduce((accumulator, current) => accumulator + current.pwins, 0)} - {this.state.leagues.reduce((accumulator, current) => accumulator + current.plosses, 0)}</h2>
			<h2>Total Leagues - {this.state.leagues.length}  Best Ball - {this.state.leagues.filter(x => x.best_ball === 1).length}</h2> 
			<table>
				<tr style={{ textAlign: 'left' }}>
					<th></th>
					<th>League</th>
					<th>2020 Record</th>
					<th>Record</th>
					<th>Fantasy Points</th>
					<th>Fantasy Points Against</th>
					<th></th>
				</tr>
				<tbody>
				{this.state.leagues.map(league => 
					<tr>
						<td>
							<img src={league.avatar === null ? blankplayer : "https://sleepercdn.com/avatars/thumbs/" + league.avatar} />
						</td>
						<td>
							{league.name}
						</td>
						<td>
							{league.pwins} - {league.plosses}
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