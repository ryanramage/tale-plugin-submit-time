var _ = require('lodash'),
    request = require('browser-request'),
    store = require('store');

module.exports = function(options) {
  if (!options) options = {}
  return init.bind(null, options);
}



function init(options, ractive, read) {

  if (!options) options = {};

  var check_availablity_interval = null;

  ractive.on('log', function(type, value){
    var pkg = ractive.get('package');
    if (!pkg) pkg = {name: 'generic'};

    var ts = new Date().getTime();
    var key = ['log', pkg.name,ts,type].join('|');
    var entry = {
      ts: ts,
      type: type,
      value: value
    }
    store.set(key, entry);
  })




  ractive.on('chapter', function(chapter){
    var names = _.keys(chapter.next_folder);
    if (names.length) return;

    // this is an end chapter
    if (store.get(chapter.id + '--end')) ractive.set('submitted', true);

    // check api availability
    var probe = function(cb){
      request('./time', function(err, resp){
        clearInterval(check_availablity_interval);
        ractive.set('network_available', true)
        var time = improve_time(resp);
        ractive.set('time', time);
        if (time.end) ractive.set('submitted', true);
      })
    }
    probe(function(err){
      if (err) check_availablity_interval = setInterval(probe, 4000);
    })
  })


  ractive.on('submit_time', function(e){
    var chapter_id = _.clone(e.context.chapter.id);
    var body = {
      chapter_id: chapter_id,
      proof: e.context.chapter.proof,
      logs: load_logs(ractive)
    };

    request({
      url: './time',
      method: 'POST',
      json: true,
      body: body
    }, function(err, resp, result){
      if (!result.ok) return console.log('resp not ok', result);

      var time = improve_time(result);
      ractive.set('time', time);

      if (time.end) {
        ractive.fire('submitted');
        ractive.set('submitted', true);
        store.set(chapter_id + '--end', true)
      }
      clear_logs(ractive);


    })
  })


}


function load_logs(ractive){
  var pkg = ractive.get('package');
  if (!pkg) pkg = {name: 'generic'};

  var pre_key = ['log',pkg.name].join('|');
  var logs = [];

  store.forEach(function(key, val) {
    if (key.indexOf(pre_key) === 0) logs.push(val);
  })
  return logs;

}

function clear_logs(ractive) {
  var pkg = ractive.get('package');
  if (!pkg) pkg = {name: 'generic'};

  var pre_key = ['log',pkg.name].join('|');

  store.forEach(function(key, val) {
    console.log('check key', key)
    if (key.indexOf(pre_key) === 0) {
      console.log('remove key', key);
      store.remove(key);
    }
  })
}


function improve_time(time){
  if (time.end) {
    time.time_ms = time.end - time.start;
    var totalSec = time.time_ms / 1000;
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = parseInt(totalSec % 60, 10);

    time.pretty = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    time.end_pretty = new Date(time.end);
  }
  return time;
}
