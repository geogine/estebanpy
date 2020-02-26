import html
import json

conn = None

tpl_room = "World:{}:Chat:{}:{}"
KEEP_TEXTS = 10


def init(c):
    global conn
    conn = c


def join(user, room_id):
    wrid = tpl_room.format(user.wid, room_id, 'sub')
    conn.sadd(wrid, user.iso)


def leave(user, room_id):
    wrid = tpl_room.format(user.wid, room_id, 'sub')
    conn.srem(wrid, user.iso)


def get_messages(wid, room_id):
    wmsgid = tpl_room.format(wid, room_id, 'msg')
    messages = conn.lrange(wmsgid, 0, 10)

    return [json.loads(s) for s in messages]


def add_message(user, room_id, msg):
    isos = get_members(user.wid, room_id)

    if not user.iso in isos:
        return None

    wmsgid = tpl_room.format(user.wid, room_id, 'msg')
    if conn.llen(wmsgid) > KEEP_TEXTS:
        conn.lpop(wmsgid)

    msg_obj = {
        "username": user.username,
        "iso": user.iso,
        "msg": html.escape(msg)
    }

    conn.rpush(wmsgid, json.dumps(msg_obj))

    return msg_obj


def get_members(wid, room_id):
    wrid = tpl_room.format(wid, room_id, 'sub')
    isos = [iso.decode('utf-8') for iso in conn.smembers(wrid)]

    return isos


def clear(wid, room_id):
    wrid = tpl_room.format(wid, room_id, 'sub')

    wmsgid = tpl_room.format(wid, room_id, 'msg')

    conn.delete(wrid)
    conn.delete(wmsgid)
