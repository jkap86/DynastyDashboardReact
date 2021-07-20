import React, { Component } from 'react';


class Theme extends Component {
	constructor(props) {
		super(props);
		this.state = {
			theme: window.localStorage.getItem("theme")

		}
		this.toggleTheme = this.toggleTheme.bind(this);
	}

	toggleTheme(e) {
		const theme = e.target.value;
		window.localStorage.setItem("theme", theme)
		document.documentElement.setAttribute("data-theme", window.localStorage.getItem("theme")); 
	}

	render() {
		return <div>
		<select onChange={this.toggleTheme}>
			<option value='bal' selected={this.state.theme === 'bal'}>BAL</option>
			<option value='buf' selected={this.state.theme === 'buf'}>BUF</option>
			<option value='chi' selected={this.state.theme === 'chi'}>CHI</option>
			<option value='dal' selected={this.state.theme === 'dal'}>DAL</option>
			<option value='den' selected={this.state.theme === 'den'}>DEN</option>
			<option value='gb' selected={this.state.theme === 'gb'}>GB</option>
			<option value='jax' selected={this.state.theme === 'jax'}>JAX</option>
			<option value='kc' selected={this.state.theme === 'kc'}>KC</option>
			<option value='mia' selected={this.state.theme === 'mia'}>MIA</option>
			<option value='ne' selected={this.state.theme === 'ne'}>NE</option>
			<option value='nyg' selected={this.state.theme === 'nyg'}>NYG</option>
			<option value='oak' selected={this.state.theme === 'oak'}>OAK</option>
			<option value='phi' selected={this.state.theme === 'phi'}>PHI</option>
			<option value='sf' selected={this.state.theme === 'sf'}>SF</option>
			<option value='was' selected={this.state.theme === 'was'}>WAS</option>		
		</select>
		</div>
	}
}

export default Theme;