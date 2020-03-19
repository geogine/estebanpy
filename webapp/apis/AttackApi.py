

class AttacksApi():
    def __init__(self, server):
        self.server = server
        self.group = 'AttacksApi'
        self.route = 'api/attacks'

        #self.repo = get_repo(World)
    
    """
    - attack nearby ship
    - board ship and take [cannons / goods / both if low HP]
    -
    """
