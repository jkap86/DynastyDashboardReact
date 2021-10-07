from flask import Flask
from bs4 import BeautifulSoup
import requests
import concurrent.futures
import re


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
	source = requests.get('https://www.dailyfantasyfuel.com/nfl/projections/draftkings').text
	soup = BeautifulSoup(source, 'html.parser')
	results = soup.find_all('tr', class_='projections-listing')
	def getPoints(result):
		name = result['data-name']
		team = result['data-team']
		opp = result['data-opp']
		proj = result['data-ppg_proj']
		position = result['data-pos']
		return({
			'name': name,
			'searchName': re.sub('[^A-Za-z]', '', name.replace('Jr', '').replace('Sr', '').replace('III', '')).lower(),
			'team': team,
			'position': position,
			'opponent': opp,
			'projection': proj
			})

	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
		playerPointsDict = list(executor.map(getPoints, results))

	return {'points': playerPointsDict}

