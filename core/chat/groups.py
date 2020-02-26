from engine import settings
from engine.modules.chat import service
from game.ctx import get_redis
from game.entities import User


class ChatGroupBase():
    def __init__(self, server):
        self.server = server
        self.name = 'Chat'

        if settings.get('chat.enabled'):
            service.init(get_redis())

    def __send(self, wid, isos, rws):
        clients = self.server.onlineMatches.get(str(wid))

        if clients:
            for client in clients:
                if client.user and client.user.iso in isos:
                    self.server.send(rws, client)

    def subscribe(self, room_id, user: User):
        service.join(user, room_id)

        isos = service.get_members(user.wid, room_id)

        self.__send(user.wid, isos, {
            "route": "Chat:subscribed",
            "username": user.username,
            "iso": user.iso,
        })

        messages = service.get_messages(user.wid, room_id)

        return {
            "messages": messages,
            "users": isos
        }

    def unsubscribe(self, room_id, user: User):
        service.leave(user, room_id)
        isos = service.get_members(user.wid, room_id)

        self.__send(user.wid, isos, {
            "route": "Chat:unsubscribed",
            "username": user.username,
            "iso": user.iso,
        })

        return {
            "username": user.username,
            "iso": user.iso,
        }

    def message(self, room_id, msg, user: User):
        msg_obj = service.add_message(user, room_id, msg)
        isos = service.get_members(user.wid, room_id)

        if msg_obj is not None:
            self.__send(user.wid, isos, {
                "route": "Chat:message",
                "room_id": room_id,
                "msg": msg_obj,
            })
