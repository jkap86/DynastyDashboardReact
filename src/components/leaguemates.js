import React, { Component } from 'react';
import Theme from './theme';
import axios from 'axios';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';

class Leaguemates extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username.toLowerCase(),
			user_id: '',
			avatar: '',
			leagues: [],
			leaguemates: [],
			leaguematesDict: []
		}
	}

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			this.setState({
				user_id: res.data.user_id,
				avatar: `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				const leagues = res.data
				this.setState({
					leagues: leagues
				})
				for (let i = 0; i < this.state.leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues[i].league_id}/users`)
					.then(res => {
						let leaguemates = this.state.leaguemates.concat(res.data);
						const findOccurences = (leaguemates = []) => {
							const res = [];
							leaguemates.forEach(el => {
								const index = res.findIndex(obj => {
									return obj['user_id'] === el.user_id;
								});
								if (index === -1) {
									res.push({
										"name": el.display_name,
										user_id: el.user_id,
										"count": 1,
										"avatar": el.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${el.avatar}`
									})
								}
								else {
									res[index]["count"]++;
								};
							});
							return res;
						};
						this.setState({
							leaguemates: leaguemates,
							leaguematesDict: findOccurences(leaguemates)
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
			<h1><img src={this.state.avatar}/>{this.state.username} Leaguemates</h1>
			<table>
				<thead>
					<tr>
						<th></th>
						<th>Leaguemate</th>
						<th>Common Leagues</th>
					</tr>
				</thead>
				<tbody>
				{this.state.leaguematesDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(leaguemate => 
					<tr key={leaguemate.user_id} className="row">
						<td><img src={leaguemate.avatar}/></td>
						<td>{leaguemate.name}</td>
						<td>{leaguemate.count}</td>
						<td><Link to={'/commonleagues/' + this.state.username + '/' + leaguemate.name}><button><span className="front">View Common Leagues</span></button></Link></td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
	}
}

export default Leaguemates;