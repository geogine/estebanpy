from game.entities import User


class GameGroup:

    def __init__(self, server):
        self.server = server
        self.name = 'Game'

    def idk(self, user: User):
        pass

        # self.server.send_to_world(user.wid, {
        # })
