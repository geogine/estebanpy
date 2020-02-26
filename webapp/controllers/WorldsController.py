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

    def index(self):
        if not verify('admin', current_user):
            return redirect(url_for('Home.welcome'))

        # js client only for the api:
        return render_template('/worlds/index.html')

    def get_join(self, invlink):
        user = current_user

        if not user.username:
            return redirect('/')

        world = self.repo.find_by_invite(invlink)
        _empty = towns.list_all(world.wid, has_player=False)

        if not world:
            return "Invite link has expired!"

        return render_template('/worlds/join.html', world=world, towns=_empty, conf=settings._conf)
