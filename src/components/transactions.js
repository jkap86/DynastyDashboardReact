import React, { Component } from 'react';
import axios from 'axios';
import Theme from './theme';
import { Link } from 'react-router-dom';
import allPlayers from '../allplayers.json';
import ReactPaginate from 'react-paginate';
import blankplayer from '../blankplayer.jpeg';


class Transactions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			username: this.props.match.params.username,
			user_id: '',
			avatar: '',
			leagues: [],
			transactions: [],
			transactionsAll: [],
			roster_id: ''
		}
		this.handleClick = this.handleClick.bind(this);
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
				const leagues = res.data;
				this.setState({
					leagues: leagues
				})
				for (let i = 0; i < this.state.leagues.length; i++) {
					axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues[i].league_id}/transactions/1`)
					.then(res => {
						const transactions = res.data
						axios.get(`https://api.sleeper.app/v1/league/${this.state.leagues[i].league_id}/rosters`)
						.then(res => {
							const rosters = res.data;
							for (let j = 0; j < transactions.length; j++) {
								let owners = [];
								for (let k = 0; k < transactions[j].roster_ids.length; k++) {
									let owner = rosters.find(x => x.roster_id === transactions[j].roster_ids[k])
									owners.push(owner === undefined ? null : owner.owner_id)
									this.setState({
										roster_id: transactions[j].roster_ids[k]
									})
								}
								let transactionsAll = this.state.transactionsAll.concat({
									status_updated: transactions[j].status_updated,
									id: transactions[j].transaction_id,
									type: transactions[j].type.replace("_", " "),
									league: this.state.leagues[i].name,
									league_id: this.state.leagues[i].league_id,
									owners: owners,
									adds: Object.keys(transactions[j].adds === null ? {} : transactions[j].adds).filter(x => transactions[j].adds[x] === this.state.roster_id),
									drops: Object.keys(transactions[j].drops === null ? {} : transactions[j].drops).filter(x => transactions[j].drops[x] === this.state.roster_id),
									roster_id: this.state.roster_id

								})
								this.setState({
									transactionsAll: transactionsAll.filter(x => x.owners.includes(this.state.user_id))
								})
							}
						})
					})
					
					
				}
			})
		})
	}

	handleClick(e) {
		this.setState({
			page: e.target.value
		})
	}

	render() {
		let transactionsAll = this.state.transactionsAll.sort((a, b) => (a.status_updated < b.status_updated) ? 1 : (a.id < b.id ? 1 : -1))
		return <div>
			<Link to="/" className="link">Home</Link>
			<Theme/>
			<h1><img src={this.state.avatar}/>{this.state.username} Transactions</h1>
			<table>
			 {transactionsAll.slice(0, 25).map(transaction =>
				<tr key={transaction.id} className="row">
					<td>{new Date(transaction.status_updated).toLocaleString("en-US")}</td>
					<td>{transaction.type.replace("_", " ")}</td>
					<td>{transaction.league}</td>
					<td>{transaction.status}</td>
					<td>{transaction.adds.map(player => <p><span style={{  fontSize: '36px' }}>+</span> {allPlayers[player].position + ' ' + allPlayers[player].first_name + ' ' + allPlayers[player].last_name + ' ' + (allPlayers[player].team === null ? 'FA' : allPlayers[player].team)}</p>)}</td>
					<td>{transaction.drops.map(player => <p><span style={{  fontSize: '36px' }}>-</span> {allPlayers[player].position + ' ' + allPlayers[player].first_name + ' ' + allPlayers[player].last_name + ' ' + (allPlayers[player].team === null ? 'FA' : allPlayers[player].team)}</p>)}</td>
				</tr>
			)}
			</table>	
		</div>
	}
}

export default Transactions;