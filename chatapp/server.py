from os.path import dirname, realpath, join

from eme.entities import load_settings
from eme.websocket import WebsocketApp
from chatapp.services import auth, startup



class GeopolyChat(WebsocketApp):

    def __init__(self):
        # eme/examples/simple_website is the working directory.
        script_path = dirname(realpath(__file__))
        conf = load_settings(join(script_path, 'config.ini'))

        super().__init__(conf, script_path)

        startup.init(self)
        auth.init(self, conf['auth'])


if __name__ == "__main__":
    app = GeopolyChat()
    app.start()
