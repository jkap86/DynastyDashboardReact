import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import allPlayers from '../allplayers.json';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';


class PlayerShares extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username,
			user_id: '',
			leagues: [],
			players: [],
			playersDict: [],
			avatar: '',
			QB: true,
			RB: true,
			WR: true,
			TE: true,
			rookie: true,
			one: true,
			two: true,
			three: true,
			four: true,
			five: true,
			six: true,
			seven: true,
			eight: true,
			nine: true,

		}
		this.filterPosition = this.filterPosition.bind(this)
		this.filterYear = this.filterYear.bind(this)
	}

	filterPosition(e) {
		const position = e.target.value
		const name = e.target.name
		let positionSelected = document.getElementsByClassName(position)
		for (let i = 0; i < positionSelected.length; i++) {
			positionSelected[i].style.display = e.target.checked === true && this.state[positionSelected[i].getAttribute('class').split(' ')[3]] === true ? 'table-row' : 'none' 
		}
		this.setState({
			[name]: e.target.checked
		})
	}

	filterYear(e) {
		const year = e.target.value
		const name = e.target.name
		let yearsSelected = document.getElementsByClassName(name)
		for (let i = 0; i < yearsSelected.length; i++) {
			yearsSelected[i].style.display = e.target.checked === true && this.state[yearsSelected[i].getAttribute('class').split(' ')[2]] ? 'table-row' : 'none'
		}
		this.setState({
			[name]: e.target.checked
		})
	} 

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/user/${this.state.username}`)
		.then(res => {
			this.setState({
				user_id: res.data.user_id,
				avatar: res.data.avatar === null ? blankplayer : `https://sleepercdn.com/avatars/thumbs/${res.data.avatar}`
			})
			axios.get(`https://api.sleeper.app/v1/user/${this.state.user_id}/leagues/nfl/2021`)
			.then(res => {
				this.setState({
					leagues: res.data
				})
				for (let i = 0; i < this.state.leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues[i].league_id}/rosters`)
					.then(res => {
						let rosters = res.data;
						for (let j = 0; j < rosters.length; j++) {
							if (rosters[j].owner_id === this.state.user_id) {
								let players = this.state.players.concat(rosters[j].players === null ? [] : rosters[j].players)
								const findOccurences = (players = []) => {
									const res = [];
									players.forEach(el => {
										const index = res.findIndex(obj => {
											return obj['name'] === el;
										});
										if (index === -1) {
											res.push({
												"name": el,
												"count": 1
											})
										}
										else {
											res[index]["count"]++;
										};
									});
									return res;
								};
								this.setState({
									players: players,
									playersDict: findOccurences(players)
								})
							}
						}
					})
				}
			})
		})
	}

	render() {
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1><img src={this.state.avatar}/>{this.state.username} Player Shares</h1>
			<h2>{this.state.leagues.length} Leagues</h2>
			<h3>
			<label>
				<input value="QB" name="QB" checked={this.state.QB} onChange={this.filterPosition} type="checkbox"/>QB
				<input value="RB" name="RB" checked={this.state.RB} onChange={this.filterPosition} type="checkbox"/>RB
				<input value="WR" name="WR" checked={this.state.WR} onChange={this.filterPosition} type="checkbox"/>WR
				<input value="TE" name="TE" checked={this.state.TE} onChange={this.filterPosition} type="checkbox"/>TE
			</label>
			<br/>
			<label>
				<input onChange={this.filterYear} checked={this.state.rookie} value="rookie" name="rookie" type="checkbox"/> 2021
				<input onChange={this.filterYear} checked={this.state.one} value="2020" name="one" type="checkbox"/> 2020
				<input onChange={this.filterYear} checked={this.state.two}  value="2019" name="two" type="checkbox"/> 2019
				<input onChange={this.filterYear} checked={this.state.three} value="2018" name="three" type="checkbox"/> 2018
				<input onChange={this.filterYear} checked={this.state.four} value="2017" name="four" type="checkbox"/> 2017
				<input onChange={this.filterYear} checked={this.state.five} value="2016" name="five" type="checkbox"/> 2016
				<input onChange={this.filterYear} checked={this.state.six} value="2015" name="six" type="checkbox"/> 2015
				<input onChange={this.filterYear} checked={this.state.seven} value="2014" name="seven" type="checkbox"/> 2014
				<input onChange={this.filterYear} checked={this.state.eight} value="2013" name="eight" type="checkbox"/> 2013
				<input onChange={this.filterYear} checked={this.state.nine} value="2012" name="nine" type="checkbox"/> 2012
			</label>
			</h3>
			<table>
				<thead>
					<tr>
						<th>Player</th>
						<th>Age</th>
						<th>College</th>
						<th>Years Exp</th>
						<th>Shares</th>
					</tr>
				</thead>
				<tbody>
				{this.state.playersDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(player => 
					<tr key={player.name} className={`row player ${allPlayers[player.name].position} ${allPlayers[player.name].years_exp === 0 ? 'rookie' : allPlayers[player.name].years_exp === 1 ? 'one' : allPlayers[player.name].years_exp === 2 ? 'two' : allPlayers[player.name].years_exp === 3 ? 'three' : allPlayers[player.name].years_exp === 4 ? 'four' : allPlayers[player.name].years_exp === 5 ? 'five' : allPlayers[player.name].years_exp === 6 ? 'six' : allPlayers[player.name].years_exp === 7 ? 'seven' : allPlayers[player.name].years_exp === 8 ? 'eight' : 'nine'}`}>
						<td>{allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team}</td>
						<td>{allPlayers[player.name].age}</td>
						<td>{allPlayers[player.name].college}</td>
						<td>{allPlayers[player.name].years_exp}</td>
						<td>{player.count}</td>
						<td style={{ paddingBottom: '10px' }}><Link to={'/playersearch/' + this.state.username + '/' + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].position + " " + (allPlayers[player.name].team === null ? 'FA' : allPlayers[player.name].team)}><button><span className="front">Search Player</span></button></Link></td>
					</tr>
				)}
				</tbody>
			</table>
		</div>
	}
}

export default PlayerShares;