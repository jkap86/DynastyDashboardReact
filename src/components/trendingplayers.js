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
			trending: []
		}
	}

	componentDidMount() {
		axios.get(`https://api.sleeper.app/v1/players/nfl/trending/add?limit=50`)
		.then(res => {
			this.setState({
				trending: res.data
			})
		})
	}

	render() {
		return <>
			<div className="tcontainer">
				<div className="ticker-wrap">
					<div className="ticker-move">
						{this.state.trending.filter(x => ['QB', 'RB', 'WR', 'TE'].includes(allPlayers[x.player_id].position)).sort((a, b) => a.count < b.count ? 1 : -1).map(player => 
							<div className="ticker-item">
								{allPlayers[player.player_id].position + " " + allPlayers[player.player_id].first_name + " " + allPlayers[player.player_id].last_name + " " + allPlayers[player.player_id].team}
								<br/>
								{player.count.toLocaleString("en-US")} Adds
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	}
}

export default TrendingPlayers;