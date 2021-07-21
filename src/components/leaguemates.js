import React, { Component } from 'react';
import Theme from './theme';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Leaguemates extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username,
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
									return obj['name'] === el.display_name;
								});
								if (index === -1) {
									res.push({
										"name": el.display_name,
										"count": 1,
										"avatar": `https://sleepercdn.com/avatars/thumbs/${el.avatar}`
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
				{this.state.leaguematesDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(leaguemate => <tr><td><img src={leaguemate.avatar}/></td><td>{leaguemate.name}</td><td>{leaguemate.count}</td></tr>)}
			</table>
		</div>
	}
}

export default Leaguemates;