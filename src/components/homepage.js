import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "./homepage.css";
import Theme from './theme';
import allPlayers from '../allplayers.json';
import axios from 'axios';


class Homepage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			viewLeagues: 'hidden',
			playerSearch: 'hidden',
			leaguemates: 'hidden',
			commonLeagues: 'hidden',
			playerShares: 'hidden',
			transactions: 'hidden',
			username: '',
			username2: '',
			player_search: '',
			keys: [],
			players: [],
			matchups: 'hidden',
			week: '',
			trendingAdds: [],
			trendingDrops: [],
			allPlayersSIO: []
		}
		this.handleClick1 = this.handleClick1.bind(this);
		this.handleClick2 = this.handleClick2.bind(this);
		this.handleClick3 = this.handleClick3.bind(this);
		this.handleClick4 = this.handleClick4.bind(this);
		this.handleClick5 = this.handleClick5.bind(this);
		this.handleClick6 = this.handleClick6.bind(this);
		this.handleClick7 = this.handleClick7.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleClick1(e) {
		this.setState({
			viewLeagues: 'visible',
			playerSearch: 'hidden',
			leaguemates: 'hidden',
			commonLeagues: 'hidden',
			playerShares: 'hidden',
			transactions: 'hidden',
			matchups: 'hidden'
		})
	}

	handleClick2(e) {
		this.setState({
			viewLeagues: 'hidden',
			playerSearch: 'visible',
			leaguemates: 'hidden',
			commonLeagues: 'hidden',
			playerShares: 'hidden',
			transactions: 'hidden',
			matchups: 'hidden'
		})
	}

	handleClick3(e) {
		this.setState({
			viewLeagues: 'hidden',
			playerSearch: 'hidden',
			leaguemates: 'visible',
			commonLeagues: 'hidden',
			playerShares: 'hidden',
			transactions: 'hidden',
			matchups: 'hidden'
		})
	}

	handleClick4(e) {
		this.setState({
			viewLeagues: 'hidden',
			playerSearch: 'hidden',
			leaguemates: 'hidden',
			commonLeagues: 'visible',
			playerShares: 'hidden',
			transactions: 'hidden',
			matchups: 'hidden'
		})
	}

	handleClick5(e) {
		this.setState({
			viewLeagues: 'hidden',
			playerSearch: 'hidden',
			leaguemates: 'hidden',
			commonLeagues: 'hidden',
			playerShares: 'visible',
			transactions: 'hidden',
			matchups: 'hidden'
		})
	}

	handleClick6(e) {
		this.setState({
			viewLeagues: 'hidden',
			playerSearch: 'hidden',
			leaguemates: 'hidden',
			commonLeagues: 'hidden',
			playerShares: 'hidden',
			transactions: 'visible',
			matchups: 'hidden'
		})
	}

	handleClick7(e) {
		this.setState({
			viewLeagues: 'hidden',
			playerSearch: 'hidden',
			leaguemates: 'hidden',
			commonLeagues: 'hidden',
			playerShares: 'hidden',
			transactions: 'hidden',
			matchups: 'visible'
		})
	}

	handleChange({target}) {
		this.setState({
			[target.name]: target.value
		})
	}



	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/players/nfl/trending/add?limit=50`)
		.then(res => {
			this.setState({
				trendingAdds: res.data
			})
		})
		axios.get(`https://api.sleeper.app/v1/players/nfl/trending/drop?limit=50`)
		.then(res => {
			this.setState({
				trendingDrops: res.data
			})
		})

		axios.get(`https://api.sleeper.app/v1/state/nfl`)
		.then(res => {
			this.setState({
				week: res.data.week
			})
		})
		let keys = Object.keys(allPlayers);
		this.setState({
			keys: keys
		});

		axios.get(`https://api.sportsdata.io/v3/nfl/scores/json/Players?key=d5d541b8c8b14262b069837ff8110635`)
		.then(res => {
			this.setState({
				allPlayersSIO: res.data
			})
		})
	}

	render() {
		let allPlayersSIO = this.state.allPlayersSIO;
		let trendingAdds = this.state.trendingAdds;
		let trendingDrops = this.state.trendingDrops;

		for (let i = 0; i < trendingAdds.length; i++) {
			let a = allPlayersSIO.find(x => x.YahooPlayerID === allPlayers[trendingAdds[i].player_id].yahoo_id)
			trendingAdds[i].picture = a === undefined ? null : a.PhotoUrl.replace('/', '')
		}

		for (let i = 0; i < trendingDrops.length; i++) {
			let a = allPlayersSIO.find(x => x.YahooPlayerID === allPlayers[trendingDrops[i].player_id].yahoo_id)
			trendingDrops[i].picture = a === undefined ? null : a.PhotoUrl.replace('/', '')
		}

		return <div>
			<Theme/>
			<h1>Dynasty Dashboard</h1>
			<ol>
				<li><button onClick={this.handleClick1}><span className="front">View All Leagues</span></button></li>
				<li><button onClick={this.handleClick2}><span className="front">Player Search</span></button></li>
				<li><button onClick={this.handleClick3}><span className="front">View All Leaguemates</span></button></li>
				<li><button onClick={this.handleClick4}><span className="front">View Common Leagues</span></button></li>
				<li><button onClick={this.handleClick5}><span className="front">View Player Shares</span></button></li>
				<li><button onClick={this.handleClick6}><span className="front">View All Transactions</span></button></li>
				<li><button onClick={this.handleClick7}><span className="front">View Matchups</span></button></li>
			</ol>
			<div className="input">
				{this.state.viewLeagues !== 'hidden' ? 
				(<div className="nav-item" id="view-leagues">
					<form method="POST">
						<input type="text" placeholder="username" name="username" onBlur={this.handleChange}/>
						<Link to={"/leagues/" + this.state.username}>
							<button type="submit" name="submitButton" value="view-leagues">
								<span className="front">View All Leagues</span>
							</button>
						</Link>
					</form>
				</div>) : null }
				{this.state.playerSearch !== 'hidden' ? 
				(<div className="nav-item" id="player-search">
					<form method="POST">
						<input type="text" placeholder="player" list="playersAuto" name="player_search" onBlur={this.handleChange}/><input type="text" placeholder="username" name="username" onChange={this.handleChange}/>
						<datalist id="playersAuto">
						{this.state.keys.sort((a, b) => (allPlayers[a].last_name > allPlayers[b].last_name) ? 1 : (allPlayers[a].last_name === allPlayers[b].last_name) ? ((allPlayers[a].first_name > allPlayers[b].first_name) ? 1 : -1) : -1).map(key => 
							<option key={key}>
								{allPlayers[key].first_name + " " + allPlayers[key].last_name + " " + allPlayers[key].position + " " + (allPlayers[key].team === null ? 'FA' : allPlayers[key].team)}
							</option>
						)}
						</datalist>
						<Link to={"/playersearch/" + this.state.username + "/" + this.state.player_search}>
							<button name="submitButton" value="player-search">
								<span className="front">Player Search</span>
							</button>
						</Link>
					</form>
				</div>) : null }
				{this.state.leaguemates !== 'hidden' ? 
				(<div className="nav-item" id="leaguemates">
					<form method="POST">
						<input type="text" placeholder="username" name="username" onBlur={this.handleChange}/>
						<Link to={"/leaguemates/" + this.state.username}>
							<button name="submitButton" value="leaguemates">
								<span className="front">View All Leaguemates</span>
							</button>
						</Link>
					</form>
				</div>) : null }
				{this.state.commonLeagues !== 'hidden' ? 
				(<div className="nav-item" id="common-leagues">
					<form method="POST">
						<input type="text" name="username" placeholder="username" onBlur={this.handleChange}/><input type="text" placeholder="username" name="username2" onBlur={this.handleChange}/>
						<Link to={"/commonleagues/" + this.state.username + "/" + this.state.username2}>
							<button name="submitButton" value="common-leagues">
								<span className="front">View Common Leagues</span>
							</button>
						</Link>
					</form>
				</div>) : null }
				{this.state.playerShares !== 'hidden' ? 
				(<div className="nav-item" id="player-shares">
					<form method="POST">
						<input type="text" name="username" placeholder="username" onBlur={this.handleChange}/>
						<Link to={"/playershares/" + this.state.username}>
							<button name="submitButton" value="player-shares">
								<span className="front">View Player Shares</span>
							</button>
						</Link>
					</form>
				</div>) : null }
				{this.state.transactions !== 'hidden' ? 
				(<div className="nav-item" id="transactions">
					<form method="POST">
						<input type="text" name="username" placeholder="username" onBlur={this.handleChange}/>
						<label for="week" style={{ fontSize: "24px", padding: "10px" }}>Week</label>
						<select type="text" name="week" placeholder="week" onBlur={this.handleChange} defaultValue={this.state.week}>
							<option>select week</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
							<option value="6">6</option>
							<option value="7">7</option>
							<option value="8">8</option>
							<option value="9">9</option>
							<option value="10">10</option>
							<option value="11">11</option>
							<option value="12">12</option>
							<option value="13">13</option>
							<option value="14">14</option>
							<option value="15">15</option>
							<option value="16">16</option>
							<option value="17">17</option>
							<option value="18">18</option>
						</select>
						<Link to={"/transactions/" + this.state.username + "/" + this.state.week}>
							<button name="submitButton" value="transactions">
								<span className="front">View All Transactions</span>
							</button>
						</Link>
					</form>
				</div>) : null }
				{this.state.matchups !== 'hidden' ? 
				(<div className = "nav-item" id="matchups">
					<form method="POST">
						<input type="text" name="username" placeholder="username" onBlur={this.handleChange}/>
						<label for="week" style={{ fontSize: "24px", padding: "10px" }}>Week</label>
						<select type="text" name="week" placeholder="week" onBlur={this.handleChange} defaultValue={this.state.week}>
							<option>select week</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
							<option value="6">6</option>
							<option value="7">7</option>
							<option value="8">8</option>
							<option value="9">9</option>
							<option value="10">10</option>
							<option value="11">11</option>
							<option value="12">12</option>
							<option value="13">13</option>
							<option value="14">14</option>
							<option value="15">15</option>
							<option value="16">16</option>
							<option value="17">17</option>
							<option value="18">18</option>
						</select>
						<Link to={"/matchups/" + this.state.username + "/" + this.state.week}>
							<button name="submitButton" value="matchups">
								<span className="front">View Matchups</span>
							</button>
						</Link>
					</form>
				</div>) : null}
			
			</div>
			<h3>Trending Players</h3>
			<table style={{  margin: 'auto', borderSpacing: '4em'  }}>
			<tr>
			<td style={{  verticalAlign: 'top'  }}>
				<table className="table">
					<tr>
						<td></td>
						<td>Player</td>
						<td>Adds</td>
					</tr>
					{this.state.trendingAdds.filter(x => ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[x.player_id].position)).sort((a, b) => a.count < b.count ? 1 : -1).map(player => 
						<tr className="row">
							<td>
								<img src={player.picture} />
							</td>
							<td>
								{allPlayers[player.player_id].position + " " + allPlayers[player.player_id].first_name + " " + allPlayers[player.player_id].last_name + " " + allPlayers[player.player_id].team}
							</td>
							<td>
								{player.count.toLocaleString("en-US")}
							</td>
						</tr>
					)}
				</table>
			</td>
			<td style={{  verticalAlign: 'top'  }}>
				<table className="table">
					<tr>
						<td></td>
						<td>Player</td>
						<td>Drops</td>
					</tr>
					{this.state.trendingDrops.filter(x => ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[x.player_id].position)).sort((a, b) => a.count < b.count ? 1 : -1).map(player =>
						<tr className="row">
							<td>
								<img src={player.picture}/>
							</td>
							<td>
								{allPlayers[player.player_id].position + " " + allPlayers[player.player_id].first_name + " " + allPlayers[player.player_id].last_name + " " + allPlayers[player.player_id].team}
							</td>
							<td>
								{player.count.toLocaleString("en-US")}
							</td>
						</tr>
					)}
				</table>
			</td>
			</tr>
			</table>
			
		</div>
	}
}

export default Homepage;