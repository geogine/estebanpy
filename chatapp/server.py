import threading
from collections import defaultdict

from eme.entities import loadConfig, loadHandlers
from eme.websocket import WebsocketApp

#from chatapp.services.server_startup import start_server


class GeopolyServer(WebsocketApp):

    def __init__(self):
        conf = loadConfig('chatapp/config.ini')

        # match id -> set of clients
        self.onlineMatches = defaultdict(set)
        #self.onlineHall = set()

        #self.threads = loadHandlers(self, "Thread", prefix=conf['websocket']['groups_folder'])

        super().__init__(conf)

    def start(self):
        # do housekeeping
        #start_server()

        # start threads
        # for tname, tcontent in self.threads.items():
        #     thread = threading.Thread(target=tcontent.run)
        #     thread.start()

        # start websocket server
        self.serveforever()

    def do_reconnect(self, client):
        if not client.user:
            return

        # remove redundant old clients by the same user
        if client.user.wid:
            clients = self.onlineMatches[str(client.user.wid)]

            for cli in list(clients):
                if cli == client:
                    # my current client, skip
                    continue

                if cli.user and cli.user.uid == client.user.uid:
                    # client has the same uid, but is not my current client
                    # -> remove it
                    #print("Reconnect: ", cli.id, '->', client.id)
                    clients.remove(cli)

        if client.user.wid:
            self.client_enter_world(client)
        else:
            self.onlineMatches[str(client.user.wid)].add(client)

    def client_enter_world(self, client):
        # if client in self.onlineHall:
        #     self.onlineHall.remove(client)

        self.onlineMatches[str(client.user.wid)].add(client)

    def client_leave_world(self, client):
        if client.user and client in self.onlineMatches[str(client.user.wid)]:
            self.onlineMatches[str(client.user.wid)].remove(client)

        # if client in self.onlineHall:
        #     self.onlineHall.remove(client)

    def client_connected(self, client):
        if client.user and client.user.wid:
            self.client_enter_world(client)
        # else:
        #     self.onlineHall.add(client)

        super().client_connected(client)

    def client_left(self, client):
        if client.user:
            #self.threads['Queue'].remove_party(client)

            if client.user.wid:
                self.groups['Worlds'].leave(client.user)

        super().client_left(client)

    def send_to_world(self, mid: str, rws: dict):
        clients = self.onlineMatches.get(str(mid))

        if clients:
            for client in clients:
                self.send(rws, client)

    # def send_to_hall(self, rws: dict):
    #
    #     for client in self.onlineHall:
    #         self.send(rws, client)

    def get_client_at(self, mid: str):
        for client in self.onlineMatches[str(mid)]:
            yield client


if __name__ == "__main__":
    app = GeopolyServer()
    app.start()
