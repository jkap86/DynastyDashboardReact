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
		<select onChange={this.toggleTheme} defaultValue={this.state.theme} style={{ fontSize: '14px', padding: '0'}}>
			<option value='bal'>BAL</option>
			<option value='buf'>BUF</option>
			<option value='chi'>CHI</option>
			<option value='dal'>DAL</option>
			<option value='den'>DEN</option>
			<option value='gb'>GB</option>
			<option value='jax'>JAX</option>
			<option value='kc'>KC</option>
			<option value='mia'>MIA</option>
			<option value='ne'>NE</option>
			<option value='nyg'>NYG</option>
			<option value='oak'>OAK</option>
			<option value='phi'>PHI</option>
			<option value='sf'>SF</option>
			<option value='was'>WAS</option>		
		</select>
		</div>
	}
}

export default Theme;