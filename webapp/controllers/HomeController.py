from flask_login import current_user
from werkzeug.utils import redirect
from flask import render_template, request
from eme.data_access import get_repo

from core.dal.users import User


class HomeController():
    def __init__(self, server):
        self.server = server
        self.repo = get_repo(User)

    def welcome(self):
        return render_template('/home/index.html')
