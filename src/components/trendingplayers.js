import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import { Link } from 'react-router-dom';
import blankplayer from '../blankplayer.jpeg';
import allPlayers from '../allplayers.json';
import './trendingplayers.css';


class TrendingPlayers extends Component {
	constructor(props) {
		super(props);
		this.state = {
			trending: [],
			players: []
		}
	}

	componentDidMount() {
		fetch('/dynastyvalues')
		.then(res => res.json()).then(data => {
			let players = data.name
			for (let i = 0; i < players.length; i++) {
				let playerx = this.state.players.concat({
					name: players[i].name,
					searchName: players[i].searchName,
					team: players[i].team,
					value: players[i].value,
					position: players[i].position
				})
				this.setState({
					players: playerx
				})
			}
		})

		
	}

	render() {
		return <>
			<div className="tcontainer">
				<div className="ticker-wrap">
					<div className="ticker-move">
						{this.state.players.map(player => 
							<div className="ticker-item">
								{player.position}
								<br/> 
								{player.name} {player.team}
								<br/>
								{Number(player.value).toLocaleString("en-US")}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	}
}

export default TrendingPlayers;