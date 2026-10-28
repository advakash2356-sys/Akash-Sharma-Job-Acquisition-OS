var $ = function (id) { return document.getElementById(id); };
function show() { chrome.storage.local.get('profile', function (r) { $('who').textContent = r.profile ? 'Profile: ' + (r.profile.fullName || r.profile.email || 'loaded') : 'No profile yet. In Job Acquisition OS, open Settings and download the profile file.'; }); }
$('file').addEventListener('change', function (e) {
  var f = e.target.files[0]; if (!f) return;
  f.text().then(function (t) { var d = JSON.parse(t); if (d.app !== 'jaos-autofill') throw new Error('Not a JAOS profile file.'); chrome.storage.local.set({ profile: d }, function () { $('msg').textContent = 'Profile imported.'; show(); }); }).catch(function (x) { $('msg').textContent = x.message; });
});
$('fill').addEventListener('click', function () {
  chrome.storage.local.get('profile', function (r) {
    if (!r.profile) { $('msg').textContent = 'Import your profile first.'; return; }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tabId = tabs[0].id;
      chrome.scripting.executeScript({ target: { tabId: tabId }, func: function (p) { window.__JAOS_PROFILE__ = p; }, args: [r.profile] })
        .then(function () { return chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['fieldmap.js', 'content.js'] }); })
        .then(function (res) { var o = res && res[res.length - 1] && res[res.length - 1].result || { filled: 0 }; $('msg').textContent = (o.site ? o.site + ': ' : '') + 'filled ' + o.filled + ' field(s). Check them, then submit yourself.'; })
        .catch(function (x) { $('msg').textContent = 'Could not fill this page: ' + x.message; });
    });
  });
});
$('clear').addEventListener('click', function () { chrome.storage.local.remove('profile', function () { $('msg').textContent = 'Removed.'; show(); }); });
show();
