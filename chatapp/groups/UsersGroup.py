from chatapp.services import auth


class UsersGroup:

    def __init__(self, app):
        self.app = app

    async def auth(self, request, client):
        tk = request.data['access_token']
        uid = request.data['uid']

        user = auth.fetch_user(tk)
        assert uid == str(user.uid)

        # set user
        client.user = user

        # todo: what if in world, chat, etc? ---> reconnect to all services

        return {
            "auth": "OK",
            "uid": user.uid
        }
