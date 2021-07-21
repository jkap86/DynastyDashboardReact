import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import { Link } from 'react-router-dom';

class CommonLeagues extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username1: this.props.match.params.username,
			username2: this.props.match.params.username2,
			user_id1: '',
			user_id2: '',
			leagues1: [],
			leagues2: []
		}
	}

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username1}`)
		.then(res => {
			this.setState({
				user_id1: res.data.user_id
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
				user_id2: res.data.user_id
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id2}/leagues/nfl/2021`)
			.then(res => {
				this.setState({
					leagues2: res.data
				})
			})
		})

	}

	render() {
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1>Common Leagues</h1>
			<h1>{this.state.username1 + " & " + this.state.username2}</h1>
			<h3>{this.state.leagues2.filter(x => this.state.leagues1.map(x => x.league_id).includes(x.league_id)).length} Leagues</h3>
			<table>
				{this.state.leagues2.filter(x => this.state.leagues1.map(x => x.league_id).includes(x.league_id)).map(league => <tr><td>{league.name}</td></tr>)}
			</table>
		</div>
	}
}

export default CommonLeagues;