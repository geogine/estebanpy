from eme.data_access import get_repo
from flask import url_for, request
from flask_login import current_user, logout_user
from werkzeug.utils import redirect

from core.dal.users import User
from webapp.services import auth


class UsersController():
    def __init__(self, server):
        self.server = server
        self.repo = get_repo(User)

    def get_list(self):
        if not current_user.admin:
            return redirect(url_for('Home.welcome'))

        return ""

    @auth.login_forbidden
    def auth(self):
        if current_user.is_authenticated:
            return "already logged in"

        if 'code' in request.args:
            # 2nd step in authorization: authorization code provided
            code = request.args['code']
            state = request.args['state']

            # get access token & user from Doors api
            token = auth.fetch_token(code)
            if token is None:
                return ':('

            user = auth.fetch_user(token.access_token)

            # copy token into user cache
            user.access_token = token.access_token
            user.expires_in = token.expires_in
            user.issued_at = token.issued_at
            self.repo.create(user)

            # we do not rely on access_token, but sessions for the web interface!
            auth.login_user(user, remember=True)

            return redirect('/')

        return redirect(auth.get_authorize_url())

    def get_logout(self):
        logout_user()

        return redirect('/')