import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route } from 'react-router-dom';
import Leagues from './components/leagues';
import Roster from './components/roster';
import PlayerSearch from './components/playerSearch';
import Leaguemates from './components/leaguemates';
import CommonLeagues from './components/commonLeagues';
import PlayerShares from './components/playerShares';
import Transactions from './components/transactions';
import Matchups from './components/matchups';
import TrendingPlayers from './components/trendingplayers';

ReactDOM.render(
  <BrowserRouter>
    <Route exact path="/" component={App}/>
    <Route path="/leagues/:username" component={Leagues}/>
    <Route path="/roster/:league_id/:username" component={Roster}/>
    <Route path="/playersearch/:username/:player" component={PlayerSearch}/>
    <Route path="/leaguemates/:username" component={Leaguemates}/>
    <Route path="/commonleagues/:username/:username2" component={CommonLeagues}/>
    <Route path="/playershares/:username" component={PlayerShares}/>
    <Route path="/transactions/:username/:week" component={Transactions}/>
    <Route path="/matchups/:username/:week" component={Matchups}/> 
  </BrowserRouter>,
  document.getElementById('root')
);

ReactDOM.render(
  <TrendingPlayers/>, document.getElementById('root2')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
