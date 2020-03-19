from authlib.integrations.flask_oauth2 import current_token
from eme.data_access import get_repo
from flask import request

from core.dal.worlds import World
from core.worlds import access, factory, players
from core.worlds.players import JoinException
from webapp.apiutils import ApiResponse
from webapp.services.auth import require_oauth


class CraftApi():
    def __init__(self, server):
        self.server = server
        self.group = 'CraftApi'
        self.route = 'api/ships'

        self.server.preset_endpoints({
            # POST ship
            "POST /api/ports/<port_id>/cannon": 'CraftApi.post_create_cannon',
            "POST /api/ports/<port_id>/recruit": 'CraftApi.post_recruit_men',
        })

    @require_oauth('profile')
    def post(self):
        """
        Craft a ship in port. Costs gold & wood
        """
        user = current_token.user

        if not access.verify('king', user, port):
            return ApiResponse(status=403)

    @require_oauth('profile')
    def post_create_cannon(self):
        """
        Craft a cannon in port. Costs gold & iron
        """
        user = current_token.user

        if not access.verify('king', user, port):
            return ApiResponse(status=403)

    @require_oauth('profile')
    def post_recruit_men(self):
        """
        Finds new men for the navy. Costs shitton of gold & food
        """
        user = current_token.user

        if not access.verify('king', user, port):
            return ApiResponse(status=403)
