import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route } from 'react-router-dom';
import Leagues from './components/leagues';
import Roster from './components/roster';
import PlayerSearch from './components/playerSearch';

ReactDOM.render(
  <BrowserRouter>
    <Route exact path="/" component={App}/>
    <Route path="/leagues/:username" component={Leagues}/>
    <Route path="/roster/:league_id/:username" component={Roster}/>
    <Route path="/playersearch/:username/:player" component={PlayerSearch}/>
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
