from werkzeug.utils import redirect
from flask import render_template, request
from flask_login import current_user
from eme.data_access import get_repo

from core.dal.users import User
from webapp.services import auth


class HomeController():
    def __init__(self, server):
        self.server = server
        self.repo = get_repo(User)

    def welcome(self):
        return render_template('/home/index.html')

    @auth.login_forbidden
    def auth(self):
        if current_user.is_authenticated:
            return "already logged in"

        if 'code' in request.args:
            # 2nd step in authorization: authorization code provided
            code = request.args['code']
            state = request.args['state']

            # get access token
            access_token = auth.fetch_token(code)

            # store user in DB
            user = auth.fetch_user(access_token)
            user.access_token = access_token

            self.repo.create(user)

            # we do not rely on access_token, but sessions for the web interface!
            auth.login_user(user, remember=True)

            return redirect('/')

        return redirect(auth.get_authorize_url())
