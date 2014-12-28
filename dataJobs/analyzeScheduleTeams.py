from bs4 import BeautifulSoup
import re
import requests
import json

teamMap = {
 'Swansea City': 'Swansea City',
 'Southampton': 'Southampton',
 'Manchester United': 'Manchester Utd',
 'Liverpool': 'Liverpool',
 'West Ham United': 'West Ham',
 'Tottenham Hotspur': 'Spurs',
 'Aston Villa': 'Aston Villa',
 'Stoke City': 'Stoke City',
 'Burnley': 'Burnley',
 'Arsenal': 'Arsenal',
 'Newcastle United': 'Newcastle Utd',
 'Hull City': 'Hull City',
 'Crystal Palace': 'Crystal Palace',
 'West Bromwich Albion': 'West Brom',
 'Queens Park Rangers': 'QPR',
 'Manchester City': 'Manchester City',
 'Everton': 'Everton',
 'Chelsea': 'Chelsea',
 'Leicester City': 'Leicester City', 
 'Sunderland': 'Sunderland'
 }

with open('schedule.html', 'r') as scheduleFile:
  scheduleHtml = scheduleFile.read().replace('\n', '')
  teamSoup = BeautifulSoup(scheduleHtml)

  dateDivs = teamSoup.findAll('div')
  for dateDiv in dateDivs:
    date = dateDiv.find('h1').text
    matchups = dateDiv.findAll('p')
    for matchup in matchups:
      teamMatches = re.search('(.+) v (.+)', matchup.text)
      request = requests.post(url='http://localhost:3000/game', 
        data=json.dumps({'date': date, 'home': teamMap[teamMatches.group(1)], 'away': teamMap[teamMatches.group(2)]}), 
        headers={'Content-Type':'application/json'})
      print request.status_code

