from time import time

import requests
from authlib.integrations.requests_client import OAuth2Auth
from authlib.oauth2.rfc6749 import TokenMixin
from authlib.oauth2.rfc6750 import BearerTokenValidator
from flask_login import LoginManager, current_user, login_user, logout_user, login_required
from eme.auth import login_forbidden
from authlib.integrations.flask_oauth2 import ResourceProtector
from eme.data_access import get_repo
from flask_oauthlib.provider import OAuth2Provider

from core.dal.users import User, UserRepository

oauth = OAuth2Provider()

require_oauth = ResourceProtector()


login_manager = LoginManager()
user_repo: UserRepository = get_repo(User)

conf = None


class DoorsCachedToken(TokenMixin):

    def __init__(self, access_token, user, expires_in=None, issued_at=None):
        self.access_token = access_token
        self.user = user

        self.expires_in = expires_in
        self.issued_at = issued_at

    def get_client_id(self):
        return conf['client_id']

    def get_scope(self):
        return conf['scope']

    def get_expires_in(self):
        return self.expires_in

    def get_expires_at(self):
        return self.expires_in + self.issued_at


class DoorsTokenValidator(BearerTokenValidator):

    def authenticate_token(self, token_string):
        # tokens are cached in a user table
        user = user_repo.find_by_token(token_string)

        if user is not None:
            return DoorsCachedToken(token_string, user, user.expires_in, user.issued_at)

        return None

        # q = session.query(token_model)
        # return q.filter_by(access_token=token_string).first()

    def request_invalid(self, request):
        return False

    def token_revoked(self, token):
        return False


def init(app, c):
    global login_manager, conf
    conf = c

    app.config["SECRET_KEY"] = conf.get("secret_key")

    login_manager.init_app(app)

    # oauth protector
    require_oauth.register_token_validator(DoorsTokenValidator())


@login_manager.user_loader
def load_user(uid):
    if uid is None or uid == 'None':
        return None

    user: User = user_repo.get(uid)

    if user is None:
        return None

    # validate if this access token is still valid
    if user.expires_at < time():
        # delete expired user cache
        user_repo.delete(user)
        return None

    return user



def get_authorize_url():
    url = '/oauth/authorize?response_type=code&client_id={}&state=xyz&scope=profile'.format(conf['client_id'])

    return conf['doors_url'] + url


def fetch_token(code):
    doors_url = conf['doors_url']
    client_id = conf['client_id']
    client_secret = conf['client_secret']

    client_auth = requests.auth.HTTPBasicAuth(client_id, client_secret)
    r = requests.post(doors_url + '/oauth/token', verify=False, allow_redirects=False, data={
        'grant_type': 'authorization_code',
        'code': code,
        'scope': 'profile',

        # 'redirect_uri': 'https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb',
    }, auth=client_auth)

    if r.status_code != 200:
        return None
    resp = r.json()
    conf['access_token'] = resp['access_token']

    return DoorsCachedToken(
        access_token=resp['access_token'],
        user=None,
        expires_in=resp['expires_in'],
        issued_at=resp.get('issued_at', time()),
    )


def fetch_user(access_token=None):
    if access_token is None:
        access_token = conf['access_token']

    doors_url = conf['doors_url']

    token_auth = OAuth2Auth({
        'token_type': 'bearer',
        'access_token': access_token
    })

    r = requests.get(doors_url + "/api/me", headers={
        "access_token": access_token
    }, auth=token_auth)

    if r.status_code != 200:
        return None

    user = User(**r.json())

    return user


from functools import wraps

from flask import current_app, request
from flask_login import current_user
from flask_login.config import EXEMPT_METHODS


def is_admin(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if request.method in EXEMPT_METHODS:
            return func(*args, **kwargs)
        elif current_app.login_manager._login_disabled:
            return func(*args, **kwargs)
        elif not current_user.admin:
            return current_app.login_manager.unauthorized()
        return func(*args, **kwargs)
    return decorated_view
