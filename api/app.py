from flask import Flask
from bs4 import BeautifulSoup
import requests
import concurrent.futures
import re
from itertools import zip_longest


app = Flask(__name__, static_folder='../build', static_url_path='/')


@app.route('/')
def index():
	return app.send_static_file('index.html')

@app.route('/roster/<path>/<path2>')
@app.route('/matchups/<path>/<path2>')
@app.route('/transactions/<path>/<path2>')
@app.route('/playersearch/<path>/<path2>')
@app.route('/commonleagues/<path>/<path2>')
@app.route('/playershares/<path>')
@app.route('/leagues/<path>')
@app.route('/leaguemates/<path>')
def catch_all(path, path2=''):
	return app.send_static_file('index.html')

@app.route('/dynastyvalues')
def get_dynasty_values():
	source = requests.get('https://keeptradecut.com/dynasty-rankings').text
	soup = BeautifulSoup(source, 'html.parser')
	results = soup.find_all('div', class_='onePlayer')
	def getValues(result):
		playerName = result.find('a').text
		team = result.find('span', class_='player-team').text
		value = result.find('p', class_='value').text
		position = result.find('p', class_='position').text
		searchName = playerName
		return({
			'name': playerName,
			'searchName': re.sub('[^A-Za-z]', '', playerName).lower(),
			'team': team,
			'position': position,
			'value': value
			})

	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:	
		playerValuesDict = list(executor.map(getValues, results))	
	return {'name': playerValuesDict}

@app.route('/projectedpoints')
def get_projected_points():
	source = requests.get('https://www.numberfire.com/nfl/fantasy/fantasy-football-ppr-projections').text
	soup = BeautifulSoup(source, 'html.parser')
	results = soup.find_all('tbody', class_='projection-table__body')
	players = results[0].find_all('tr')
	projections = results[1].find_all('tr')
	def getPoints(player):
		playerName = player.select('td[class=player] > a > span[class=full]')[0].text
		playerInfo = next(item for item in projections if item['data-row-index'] == player['data-row-index'])
		projection = playerInfo.find_all('td')[0].text
		opponent = playerInfo.find_all('td')[1].text
		rank = playerInfo.find_all('td')[4].text
		position = player.find('td').text
		return({
			'name': playerName,
			'searchName': re.sub('[^A-Za-z]', '', playerName).lower(),
			'rank': re.sub('[^0-9.]', '', rank),
			'opponent': re.sub('[^A-Z]', '', opponent),
			'projection': re.sub('[^0-9.]', '', projection)
			})
	
	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
		playerProjectionsDict = list(executor.map(getPoints, players))

	return {'points': playerProjectionsDict}

@app.route('/injuries')
def get_injuries():
	source = requests.get('https://www.espn.com/nfl/injuries').text
	soup = BeautifulSoup(source, 'html.parser')
	results = soup.find_all('tr', class_='Table__TR Table__TR--sm Table__even')
	def getInjuries(result):
		playerName = result.find('a', class_='AnchorLink').text
		status = result.find('td', class_="col-stat Table__TD").find('span', class_='TextStatus').text
		position = result.find('td', class_="col-pos Table__TD").text
		return({
			'name': playerName,
			'searchName': re.sub('[^A-Za-z]', '', playerName).lower(),
			'position': position,
			'status': status
			})
	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
		playerInjuriesDict = list(executor.map(getInjuries, results))

	return {'player': playerInjuriesDict}

@app.route('/weather/<week>')
def weather(week):	
	source = requests.get('https://nflweather.com/en/week/2021/week-' + str(week)).text
	soup = BeautifulSoup(source, 'html.parser')
	table = soup.find('tbody')
	results = table.find_all('tr')
	def getWeather(result):
		forecast = result.find_all('td')[-4].text
		wind = result.find_all('td')[-2].text
		homeTeam = result.find_all('td')[-8].text
		return({
			'homeTeam': re.sub('[\n]', '', homeTeam),
			'forecast': re.sub('[\n]' ,'' , forecast).strip(),
			'wind': wind
			})
	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
		forecastDict = list(executor.map(getWeather, results))

	return {'weather': forecastDict}
	
@app.route('/stats/<week>')
def stats(week):
	source = requests.get('https://www.rotoballer.com/nfl-game-center-live-scores-fantasy-football-scoreboard?week=' + str(week)).text
	soup = BeautifulSoup(source, 'html.parser')
	results = soup.select("table[id=player_stats] > tbody[id=fbody] > tr[id=zebra]")
	def getStats(result):
		completions = result.find_all('td')[8].text
		link = result.select("td > a")[0]['href']
		searchName = result.select("td > a")[0].text
		passYds = result.find_all('td')[10].text
		passTD = result.find_all('td')[11].text
		passInt = result.find_all('td')[12].text
		rushes = result.find_all('td')[14].text
		rushYds = result.find_all('td')[15].text
		rushTD = result.find_all('td')[17].text
		rec = result.find_all('td')[19].text
		targets = result.find_all('td')[20].text
		recYds = result.find_all('td')[21].text
		recTD = result.find_all('td')[23].text
		return({
			'id': link.split('/')[3],
			'searchName': re.sub('[^A-Za-z]', '', searchName).lower(),
			'c_a': completions,
			'passYds': passYds,
			'passTD': passTD,
			'passInt': passInt,
			'rushes': rushes,
			'rushYds': rushYds,
			'rushTD': rushTD,
			'rec': rec,
			'targets': targets,
			'recYds': recYds,
			'recTD': recTD
			})
	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
		statsDict = list(executor.map(getStats, results))

	return {'stats': statsDict}

@app.route('/matchupsdata/<week>/<userid>')
def matchups(week, userid):
	leagues = requests.get('https://api.sleeper.app/v1/user/' + userid + '/leagues/nfl/2021').json()
	leagues = list(filter(lambda x: 'best_ball' not in x['settings'] or x['settings']['best_ball'] != 1, leagues))
	def getPlayers(league):
		rosters = requests.get('https://api.sleeper.app/v1/league/' + league['league_id'] + '/rosters').json()
		matchups = requests.get('https://api.sleeper.app/v1/league/' + league['league_id'] + '/matchups/' + week).json()
		roster = [r for r in rosters if r['owner_id'] == userid or (r['co_owners'] != None and userid in r['co_owners'])]
		rosterID = roster[0]['roster_id'] if roster != [] else 0
		team = [m for m in matchups if m['roster_id'] == rosterID]
		opponent = [m for m in matchups if m['roster_id'] != rosterID and len(team) > 0 and m['matchup_id'] == team[0]['matchup_id']]

		starters = team[0]['starters'] if roster != [] else None
		if starters != None:
			starters = list(map(lambda x: {'id': x, 'league': {'name': league['name'], 'lineup': team[0]['starters'], 'points': team[0]['players_points']}}, starters))
		
		startersOpp = opponent[0]['starters'] if opponent != [] else None
		if startersOpp != None:
			startersOpp = list(map(lambda x: {'id': x, 'league': {'name': league['name'], 'lineup': opponent[0]['starters'], 'points': opponent[0]['players_points'] }}, startersOpp))

		return {'starters': starters, 'startersOpp': startersOpp}

	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
		playersDict = list(executor.map(getPlayers, leagues))
	
	starters = list(filter(lambda x: x['starters'] != None, playersDict))	
	starters = [x['starters'] for x in starters]
	starters = [x for y in starters for x in y]

	startersOpp = list(filter(lambda x: x['startersOpp'] != None, playersDict))
	startersOpp = [x['startersOpp'] for x in startersOpp]
	startersOpp = [x for y in startersOpp for x in y]
	def getCount(players, type):
		res = []
		for player in players:
			index = next((index for (index, d) in enumerate(res) if d['id'] == player['id']), None)
			if type == 1:	
				if index != None:
					res[index]['countFor'] += 1
					res[index]['leaguesFor'].append({'league': player['league']})

				else:
					res.append({
						'id': player['id'],
						'countFor': 1,
						'leaguesFor': [{'league': player['league']}]
					})
			else:
				if index != None:
					res[index]['countAgainst'] += 1
					res[index]['leaguesAgainst'].append({'league': player['league']})

				else:
					res.append({
						'id': player['id'],
						'countAgainst': 1,
						'leaguesAgainst': [{'league': player['league']}]
						

					})

		return res  
				
	starters = getCount(starters, 1)
	startersOpp = getCount(startersOpp, 2)
	starterKeys = [x['id'] for x in starters]
	oppKeys = [x['id'] for x in startersOpp]
	allKeys = starterKeys + list(set(oppKeys) - set(starterKeys))
	allStarters = []
	for key in allKeys:
		allStarters.append({
			'id': key,
			'countFor': [x['countFor'] for x in starters if x['id'] == key],
			'countAgainst': [x['countAgainst'] for x in startersOpp if x['id'] == key],
			'leaguesFor': [x['leaguesFor'] for x in starters if x['id'] == key],
			'leaguesAgainst': [x['leaguesAgainst'] for x in startersOpp if x['id'] == key]

		})

	return {'data': allStarters }

