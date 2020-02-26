
let access_token = null;

export function init_api(at) {
  access_token = at;
}

export function request(group, data, cb) {
  if (access_token == null)
    throw "access_token not provided";

  const method = group.split(' ')[0].upper();
  const url = group.substr(len(method)+1, len(group));


  return fetch(url, {
    method: method,
    mode: 'same-origin',
    cache: 'no-cache',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    credentials: 'omit',
    body: method == 'GET' ? undefined : JSON.stringify(data),
    headers: {
      'Authorization': 'bearer' + ' ' + access_token,
      'Content-Type': 'application/json'
    }
  }).then((resp)=>{
    if (resp.status == 200)
      return resp.json();
  }).then(cb).catch((error) => {
    console.error('Error:', error);
  });

}
