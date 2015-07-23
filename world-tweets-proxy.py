import os
import json
import random
import requests
import string

import cherrypy

from constants import city_data

twitter_bearer_token = 'AAAAAAAAAAAAAAAAAAAAAADqggAAAAAADaXS3JkZSt5m6RRmJ0dXZNkE7%2BE%3DOCNTnvPlh7UVYtJkhZDkjjKDIEeqI4IoqD3SBlmj5SyEeNt4Ca'
yahoo_client_id = 'dj0yJmk9bE5ORHo2MFpJR0NoJmQ9WVdrOVJqbHpOMXBTTTJVbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1iZQ--'

class WorldTweetsProxy(object):
    _cp_config = {'tools.CORS.on': True}
    @cherrypy.expose
    def index(self):
        return "wocoburguesa, 2015"

    @cherrypy.expose
    def places_proxy(self, place=None):
        if place:
            twitter_headers = {
                'Authorization': 'Bearer ' + twitter_bearer_token
                }
#            r = requests.get(
#                'http://where.yahooapis.com/v1/places.q' +
#                "('" + place + "')?" +
#                'appid=' + yahoo_client_id +
#                '&format=json'
#                )
#            yahoo_response = json.loads(r.text)
#            print r.text
#            woeid = yahoo_response['places']['place'][0]['woeid']

#            r = requests.get(
#                'https://api.twitter.com/1.1/trends/available.json',
#                headers=twitter_headers
#                )
#            places = json.loads(r.text)
#            us_places = []
#            for place in places:
#                print place['country']
#                if place['country'] == 'United States':
#                    us_places.append(place)
#            return json.dumps(us_places)
            print city_data.city_data
            woeid = city_data.city_data[place][0]['woeid']

            twitter_url = 'https://api.twitter.com/1.1/trends/place.json?id=' +\
                str(woeid)
            print twitter_url

            r = requests.get(
                twitter_url,
                headers=twitter_headers
                )
            return r.text
        else:
            return ''

def CORS():
    cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"

if __name__ == '__main__':
    conf = {
        '/': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
            'tools.sessions.on': True,
            'tools.response_headers.on': True,
            'tools.CORS.on': True
            }
        }
    cherrypy.tools.CORS = cherrypy.Tool('before_handler', CORS)
    cherrypy.config.update({'server.socket_host': '0.0.0.0',})
    cherrypy.config.update({'server.socket_port': int(os.environ.get('PORT', '5000')),})
    cherrypy.quickstart(WorldTweetsProxy())
