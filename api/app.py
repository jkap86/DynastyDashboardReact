from flask import Flask
from bs4 import BeautifulSoup
import requests
import concurrent.futures
import re


app = Flask(__name__)


@app.route('/')
def index():
	return app.send_static_file('index.html')

@app.route('/', defaults={'path1': '', 'path2': ''})
@app.route('/<path:path1>', defaults={'path2': ''})
@app.route('/<path:path1>/<path:path2>')
def catch_all(path1, path2):
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
			'value': value,
			})

	with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:	
		playerValuesDict = list(executor.map(getValues, results))	
	return {'name': playerValuesDict}