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
			playerValues: [],
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
		this.checkAll = this.checkAll.bind(this)
	}

	checkAll(e) {
		let rookies = document.getElementsByClassName("rookie")
		for (let i = 0; i < rookies.length; i++) {
			rookies[i].style.display = this.state.rookie === false ? 'table-row' : 'none'
		}
		let one = document.getElementsByClassName("one")
		for (let i = 0; i < one.length; i++) {
			one[i].style.display = this.state.one === false ? 'table-row' : 'none'
		}
		let two = document.getElementsByClassName("two")
		for (let i = 0; i < two.length; i++) {
			two[i].style.display = this.state.two === false ? 'table-row' : 'none'
		}
		let three = document.getElementsByClassName("three")
		for (let i = 0; i < three.length; i++) {
			three[i].style.display = this.state.three === false ? 'table-row' : 'none'
		}
		let four = document.getElementsByClassName("four")
		for (let i = 0; i < four.length; i++) {
			four[i].style.display = this.state.four === false ? 'table-row' : 'none'
		}
		let five = document.getElementsByClassName("five")
		for (let i = 0; i < five.length; i++) {
			five[i].style.display = this.state.five === false ? 'table-row' : 'none'
		}
		let six = document.getElementsByClassName("six")
		for (let i = 0; i < six.length; i++) {
			six[i].style.display = this.state.six === false ? 'table-row' : 'none'
		}
		let seven = document.getElementsByClassName("seven")
		for (let i = 0; i < seven.length; i++) {
			seven[i].style.display = this.state.seven === false ? 'table-row' : 'none'
		}
		let eight = document.getElementsByClassName("eight")
		for (let i = 0; i < eight.length; i++) {
			eight[i].style.display = this.state.eight === false ? 'table-row' : 'none'
		}
		let nine = document.getElementsByClassName("nine")
		for (let i = 0; i < nine.length; i++) {
			nine[i].style.display = this.state.nine === false ? 'table-row' : 'none'
		}
		this.setState({
			rookie: !this.state.rookie,
			one: !this.state.one,
			two: !this.state.two,
			three: !this.state.three,
			four: !this.state.four,
			five: !this.state.five,
			six: !this.state.six,
			seven: !this.state.seven,
			eight: !this.state.eight,
			nine: !this.state.nine
		})

		


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
		fetch('/dynastyvalues')
		.then(res => res.json()).then(data => {
			let players = data.name
			this.setState({
				playerValues: players
			})
		})

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
								let players = this.state.players.concat(rosters[j].players === null ? [] : rosters[j].players.map(x => {return {id: x, wins: rosters[j].settings.wins, losses: rosters[j].settings.losses}}))
									
								const findOccurences = (players = []) => {
									const res = [];
									players.forEach(el => {
										const index = res.findIndex(obj => {
											return obj['name'] === el.id;
										});
										if (index === -1 && el !== null) {
											res.push({
												"name": el.id,
												"count": 1,
												"wins": el.wins,
												"losses": el.losses
											})
										}
										else {
											res[index]["count"]++;
											res[index]["wins"] = res[index]["wins"] + el.wins;
											res[index]["losses"] = res[index]["losses"] + el.losses
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
		for (let i = 0; i < this.state.playersDict.length; i++) {
			let p = this.state.playerValues.find(x => allPlayers[this.state.playersDict[i].name] !== undefined && x.searchName === allPlayers[this.state.playersDict[i].name].search_full_name)
			this.state.playersDict[i].value = p === undefined ? '0' : p.value
		}

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
				<input onChange={this.filterYear} checked={this.state.rookie} value="rookie" name="rookie" id="rookie" type="checkbox"/> 2021
				<input onChange={this.filterYear} checked={this.state.one} value="2020" name="one" id="one" type="checkbox"/> 2020
				<input onChange={this.filterYear} checked={this.state.two}  value="2019" name="two" type="checkbox"/> 2019
				<input onChange={this.filterYear} checked={this.state.three} value="2018" name="three" type="checkbox"/> 2018
				<input onChange={this.filterYear} checked={this.state.four} value="2017" name="four" type="checkbox"/> 2017
				<input onChange={this.filterYear} checked={this.state.five} value="2016" name="five" type="checkbox"/> 2016
				<input onChange={this.filterYear} checked={this.state.six} value="2015" name="six" type="checkbox"/> 2015
				<input onChange={this.filterYear} checked={this.state.seven} value="2014" name="seven" type="checkbox"/> 2014
				<input onChange={this.filterYear} checked={this.state.eight} value="2013" name="eight" type="checkbox"/> 2013
				<input onChange={this.filterYear} checked={this.state.nine} value="2012" name="nine" type="checkbox"/> Pre-2013
			</label>
			<button onClick={this.checkAll}>
				<span className="front" style={{ fontSize: '1.2em' }}>
				Check/Uncheck All
				</span>
			</button>
			</h3>
			<table className="table">
				<thead>
					<tr>
						<th></th>
						<th>Player</th>
						<th>Age</th>
						<th>College</th>
						<th>Yrs<br/>Exp</th>
						<th>Value</th>
						<th>Record</th>
						<th>Shares</th>
					</tr>
				</thead>
				<tbody>
				{this.state.playersDict.sort((a, b) => (a.count < b.count) ? 1 : -1).map(player => 
					<tr key={player.name} className={`row player ${allPlayers[player.name].position} ${allPlayers[player.name].years_exp === 0 ? 'rookie' : allPlayers[player.name].years_exp === 1 ? 'one' : allPlayers[player.name].years_exp === 2 ? 'two' : allPlayers[player.name].years_exp === 3 ? 'three' : allPlayers[player.name].years_exp === 4 ? 'four' : allPlayers[player.name].years_exp === 5 ? 'five' : allPlayers[player.name].years_exp === 6 ? 'six' : allPlayers[player.name].years_exp === 7 ? 'seven' : allPlayers[player.name].years_exp === 8 ? 'eight' : 'nine'}`}>
						<td><img src={`https://assets1.sportsnet.ca/wp-content/uploads/players/280/${allPlayers[player.name].swish_id === null ? allPlayers[player.name].stats_id : allPlayers[player.name].swish_id}.png`} /></td>
						<td>{allPlayers[player.name].position + " " + allPlayers[player.name].first_name + " " + allPlayers[player.name].last_name + " " + allPlayers[player.name].team}</td>
						<td>{allPlayers[player.name].age}</td>
						<td>{allPlayers[player.name].college}</td>
						<td>{allPlayers[player.name].years_exp}</td>
						<td>{Number(player.value).toLocaleString("en-US")}</td>
						<td>{player.wins} - {player.losses} <br/> {(Number(player.wins) / (Number(player.wins) + Number(player.losses))).toFixed(4)}</td>
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