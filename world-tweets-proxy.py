import cherrypy
import os
class HelloWorld(object):
    def index(self):
        return "Hello World!"
    index.exposed = True

if __name__ == '__main__':
    cherrypy.config.update({'server.socket_host': '0.0.0.0',})
    cherrypy.config.update({'server.socket_port': int(os.environ.get('PORT', '5000')),})
    cherrypy.quickstart(HelloWorld())
