import requests
import json

users = [ 
  { "_id" : "5474ff373cba6e08005e591f", "name" : "Javi" },
  { "_id" : "54750fc9d9c80be03a99c232", "name" : "Jordan" },
  { "_id" : "54750fe8d9c80be03a99c233", "name" : "Alex" },
  { "_id" : "54751011d9c80be03a99c235", "name" : "Geoff" } 
]

teams = [
  {'name': 'Arsenal', 'owner': 'Alex'},
  {'name': 'Manchester Utd', 'owner': 'Javi'},
  {'name': 'Aston Villa', 'owner': 'Javi'},
  {'name': 'Newcastle Utd', 'owner': 'Alex'},
  {'name': 'Burnley', 'owner': 'Geoff'},
  {'name': 'QPR', 'owner': 'Geoff'},
  {'name': 'Chelsea', 'owner': 'Jordan'},
  {'name': 'Southampton', 'owner': 'Jordan'},
  {'name': 'Crystal Palace', 'owner': 'Javi'},
  {'name': 'Spurs', 'owner': 'Alex'},
  {'name': 'Everton', 'owner': 'Jordan'},
  {'name': 'Stoke City', 'owner': 'Alex'},
  {'name': 'Hull City', 'owner': 'Jordan'},
  {'name': 'Sunderland', 'owner': 'Jordan'},
  {'name': 'Leicester City', 'owner': 'Alex'},
  {'name': 'Swansea City', 'owner': 'Javi'},
  {'name': 'Liverpool', 'owner': 'Javi'},
  {'name': 'West Brom', 'owner': 'Geoff'},
  {'name': 'Manchester City', 'owner': 'Geoff'},
  {'name': 'West Ham', 'owner': 'Geoff'}
]

def findId(team):
  for user in users:
    if user['name'] == team['owner']:
      return user['_id']

for team in teams:
  print team
  team['owner'] = findId(team)
  request = requests.post(url=str.format('http://localhost:3000/teams'), data=json.dumps(team), headers={'Content-Type':'application/json'})
  print request.status_code
