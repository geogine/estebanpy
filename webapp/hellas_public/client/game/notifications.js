import {world} from '/engine/modules/worlds/world.js'
import {load, onload, toload} from '/engine/loader.js';

import {client} from '/client/game/websocket.js';
import {townSource} from '/client/layers/towns.js';


export function add_sys_message(event_id, iso, ...params) {
  let msg = messages[event_id];

  if (params)
    msg = msg.format(...params);

  gui.flash(msg, "white", iso);


  // add timestamp for chat
  msg = `[#${world.rounds}] <span class="small">${msg}</span>`;

  // play sound
  play_sfx(event_id);

  // hack
  gui.$refs['global-chat'].add_message({
    msg: msg,
    iso: iso,
    username: undefined
  });
}

export function play_sfx(sfx_id) {
  // if (sounds[sfx_id].getVolume() > 5)
  //   sounds[sfx_id].play();
}

export function set_vol(sfx_id, vol) {
  if (sounds[sfx_id].getVolume() != vol)
    sounds[sfx_id].setVolume(vol);
}


const formats = {
  emperor: 'mp3', victory: 'mp3'
};

const sounds = {
  // local only sounds (only I hear it!)
  music: null,
  chat_msg: null,
};

// load("sounds", function () {
//   for (let sfx of Object.keys(sounds)) {
//     let sound = new buzz.sound(`/sounds/${sfx}`, {formats: [formats[sfx]||"wav"]});

//     sounds[sfx] = sound;
//   }

//   // finished loading sounds -- well, we actually didn't
//   this.loaded();
// });



// All in-game event message templates:
const messages = {
  // General
  invalid_params: "invalid_params",
  bad_conf: "Unexpected item.",

};

export function init_chat(chat, conf) {
  /**
   * Here you can add your custom commands and emojis
   * to use an emoji: 
   *   :happy:
   *
   * to use an action (command)
   *   /surrender and ENTER
   **/
  chat.emojis = {
    'meh': 'meh.png',
    'flup': 'flup.png',
    'eme': 'eme_logo.png',
    'headbop': 'headbop.gif',
    'thunk': 'thunk.png',
    'sadgry': 'sadgry.png',
    'obey': 'obey.png',
    'smh': 'smh.gif',
    'cat': 'katzen.png',
    'whoa mama': 'whoa_mama.png',
    'wowzors': 'wowzors.png',
    'pappa': 'pappa.gif',

    'triggered': 'triggered.png',
    'trump': 'trump.gif',
    'mummy': 'mummy.png',
    'metroplier': 'metroplier.png',
    'sorry_hihi': 'sorry_hihi.png',
    'quigon': 'quigon.png',
  };

  chat.actions = {
    "ilyesadam bazmeg": ()=>{
      // gives you infantry at all city tiles
    },
    "and now my order is in YOUR court": () =>{
      // idk
    },
  };
  
  chat.username_func = (iso) =>{
    townSource.getFeatureById(iso).get('username');
  };

  try {
    chat.config = conf;
    chat.sub();

    chat.onmessage = () => {
      play_sfx("chat_msg");
    };

  } catch(e) {
    console.error("Chat module failed: ", e);
  }

  window.onbeforeunload = () => {
    chat.unsub();
  }
}
