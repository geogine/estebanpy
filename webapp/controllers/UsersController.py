from eme.data_access import get_repo
from flask import url_for
from flask_login import current_user, logout_user
from werkzeug.utils import redirect

from core.dal.users import User


class UsersController():
    def __init__(self, server):
        self.server = server
        self.repo = get_repo(User)

    def get_list(self):
        if not current_user.admin:
            return redirect(url_for('Home.welcome'))

        return ""

    def get_logout(self):
        logout_user()

        return redirect('/')