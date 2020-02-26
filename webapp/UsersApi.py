def get_users(self, wid):
    """
    Generates invite link
    """
    user = getUser()

    if not user.wid or not user.username:
        return ApiResponse({"err": True})

    return ApiResponse({iso: name for iso, name in users.list_names(wid)})

