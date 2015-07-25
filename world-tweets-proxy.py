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
    def places_detail(self, place=None):
        return json.dumps(city_data.city_data[place])

    @cherrypy.expose
    def places_proxy(self, place=None):
        if place:
            twitter_headers = {
                'Authorization': 'Bearer ' + twitter_bearer_token
                }

            twitter_url = 'https://api.twitter.com/1.1/trends/place.json?id=' +\
                place
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
