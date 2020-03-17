from eme.data_access import get_repo
from flask import url_for, render_template
from flask_login import current_user
from werkzeug.utils import redirect

from core.dal.worlds import World
from core.worlds.access import verify


class WorldsController():
    def __init__(self, server):
        self.server = server
        self.group = 'Worlds'

        self.repo = get_repo(World)
        self.server.preset_endpoints({
            "GET /worlds/<wid>/chat": 'Worlds.get_chat',
            "GET /worlds/chat": 'Worlds.get_chat',
        })

    def index(self):
        if not verify('admin', current_user):
            return redirect(url_for('Home.welcome'))

        # js client only for the api:
        return render_template('/worlds/index.html')

    def get_chat(self, wid=None):
        if wid:
            world = self.repo.get(wid)
        else:
            world = current_user.world

        addr = self.server.conf['ws_address']

        return render_template('/worlds/chat.html', ws_addr = addr, world=world)

    def get_join(self, invlink):
        user = current_user

        if not user.username:
            return redirect('/')

        world = self.repo.find_by_invite(invlink)
        _empty = towns.list_all(world.wid, has_player=False)

        if not world:
            return "Invite link has expired!"

        return render_template('/worlds/join.html', world=world, towns=_empty, conf=settings._conf)
