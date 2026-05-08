/* Multi-select integration copied from alert_UI_fix and adapted for Alert_Rule_UI_Auto_Approve.html */
window.multiSelectRegistry = window.multiSelectRegistry || {};
var multiSelectRegistry = window.multiSelectRegistry;

function createMultiSelect(config) {
  var root = document.getElementById(config.id);
  if (!root) return;
  root.innerHTML = '';

  var display = document.createElement('button');
  display.type = 'button';
  display.className = 'multiselect-display';

  var dropdown = document.createElement('div');
  dropdown.className = 'multiselect-dropdown';

  function addOptionRow(label, value) {
    var row = document.createElement('div');
    row.className = 'multiselect-option';
    var labelEl = document.createElement('label');
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = value;
    labelEl.appendChild(cb);
    labelEl.appendChild(document.createTextNode(label));
    row.appendChild(labelEl);
    dropdown.appendChild(row);
    return cb;
  }

  var selectAllCb = addOptionRow('Select All', '__all__');
  var optionCbs = [];
  var selectedValues = (config.selected || []).slice();

  function getSelectedValues() {
    return optionCbs.filter(function(cb) { return cb.checked; }).map(function(cb) { return cb.value; });
  }

  function renderOptions(options, selected) {
    optionCbs = [];
    while (dropdown.children.length > 1) {
      dropdown.removeChild(dropdown.lastChild);
    }
    options.forEach(function(opt) {
      var cb = addOptionRow(opt, opt);
      cb.checked = (selected || []).indexOf(opt) !== -1;
      cb.addEventListener('change', function() {
        updateDisplay();
        if (typeof config.onChange === 'function') {
          config.onChange(getSelectedValues());
        }
      });
      optionCbs.push(cb);
    });
  }

  function updateDisplay() {
    var values = getSelectedValues();
    if (values.length === 0) {
      display.textContent = '0 selected';
    } else if (values.length <= 2) {
      display.textContent = values.join(', ');
    } else {
      display.textContent = values.length + ' selected';
    }
    var allChecked = optionCbs.length > 0 && values.length === optionCbs.length;
    selectAllCb.checked = allChecked;
    selectAllCb.indeterminate = values.length > 0 && !allChecked;
  }

  selectAllCb.addEventListener('change', function() {
    var next = selectAllCb.checked;
    optionCbs.forEach(function(cb) { cb.checked = next; });
    updateDisplay();
    if (typeof config.onChange === 'function') {
      config.onChange(getSelectedValues());
    }
  });

  display.addEventListener('click', function() {
    root.classList.toggle('open');
  });

  dropdown.addEventListener('click', function(e) { e.stopPropagation(); });

  root.appendChild(display);
  root.appendChild(dropdown);
  renderOptions(config.options || [], selectedValues);
  updateDisplay();

  multiSelectRegistry[config.id] = {
    getSelected: getSelectedValues,
    getOptions: function() { return optionCbs.map(function(cb) { return cb.value; }); },
    setOptions: function(options) {
      var previous = getSelectedValues();
      var nextOptions = (options || []).slice();
      var nextSelected = previous.filter(function(v) { return nextOptions.indexOf(v) !== -1; });
      renderOptions(nextOptions, nextSelected);
      updateDisplay();
    },
    setSelected: function(selected) {
      var selectedSet = new Set(selected || []);
      optionCbs.forEach(function(cb) { cb.checked = selectedSet.has(cb.value); });
      updateDisplay();
    }
  };

  return multiSelectRegistry[config.id];
}

function getMultiSelectSelected(id) {
  var instance = multiSelectRegistry[id];
  return instance ? instance.getSelected() : [];
}

function getConditionLevelOptions() {
  var fromEl = document.getElementById('level_from');
  var toEl = document.getElementById('level_to');
  var from = fromEl ? parseInt(fromEl.value, 10) : 1;
  var to = toEl ? parseInt(toEl.value, 10) : 5;
  if (isNaN(from)) from = 1;
  if (isNaN(to)) to = 5;
  from = Math.max(1, Math.min(5, from));
  to = Math.max(1, Math.min(5, to));
  if (fromEl) fromEl.value = String(from);
  if (toEl) toEl.value = String(to);
  var min = Math.min(from, to);
  var max = Math.max(from, to);
  var levels = [];
  for (var i = min; i <= max; i++) levels.push(String(i));
  return levels;
}

function syncGroupScopedOptions() {
  var levelOptions = getConditionLevelOptions();
  var platformSelected = getMultiSelectSelected('platform-multiselect');
  var incidentSelected = getMultiSelectSelected('incident-type-multiselect');
  var platformAll = (multiSelectRegistry['platform-multiselect'] && multiSelectRegistry['platform-multiselect'].getOptions()) || [];
  var incidentAll = (multiSelectRegistry['incident-type-multiselect'] && multiSelectRegistry['incident-type-multiselect'].getOptions()) || [];
  var platformScoped = platformSelected.length ? platformSelected : platformAll;
  var incidentScoped = incidentSelected.length ? incidentSelected : incidentAll;

  ['group1-level-multiselect','group2-level-multiselect'].forEach(function(id){ if (multiSelectRegistry[id]) multiSelectRegistry[id].setOptions(levelOptions); });
  ['group1-platform-multiselect','group2-platform-multiselect'].forEach(function(id){ if (multiSelectRegistry[id]) multiSelectRegistry[id].setOptions(platformScoped); });
  ['group1-incident-multiselect','group2-incident-multiselect'].forEach(function(id){ if (multiSelectRegistry[id]) multiSelectRegistry[id].setOptions(incidentScoped); });
}

document.addEventListener('click', function(e) {
  document.querySelectorAll('.multiselect.open').forEach(function(openRoot){ if (!openRoot.contains(e.target)) openRoot.classList.remove('open'); });
});

// Initialize instances (use IDs added earlier)
createMultiSelect({ id: 'mention-type-multiselect', options: ['post','comment','message'], selected: ['post'] });
createMultiSelect({ id: 'platform-multiselect', options: ['Facebook','Tiktok','X','Theards','Instagram'], selected: [], onChange: syncGroupScopedOptions });
createMultiSelect({ id: 'incident-type-multiselect', options: ['Complaint','App Crash','Service Delay','Payment Error','Delivery Issue','Account Problem','Product Quality','Refund Request','Login Failure'], selected: [], onChange: syncGroupScopedOptions });
createMultiSelect({ id: 'group1-level-multiselect', options: [], selected: ['2'] });
createMultiSelect({ id: 'group2-level-multiselect', options: [], selected: ['5'] });
createMultiSelect({ id: 'group1-platform-multiselect', options: [], selected: [] });
createMultiSelect({ id: 'group2-platform-multiselect', options: [], selected: ['Facebook'] });
createMultiSelect({ id: 'group1-incident-multiselect', options: [], selected: [] });
createMultiSelect({ id: 'group2-incident-multiselect', options: [], selected: ['Complaint'] });
createMultiSelect({ id: 'group1-impact-multiselect', options: ['Low','Medium','High','Critical','Emergency'], selected: ['High'] });
createMultiSelect({ id: 'group2-impact-multiselect', options: ['Low','Medium','High','Critical','Emergency'], selected: ['Critical'] });

if (document.getElementById('level_from')) document.getElementById('level_from').addEventListener('input', syncGroupScopedOptions);
if (document.getElementById('level_to')) document.getElementById('level_to').addEventListener('input', syncGroupScopedOptions);
if (document.getElementById('level_from')) document.getElementById('level_from').addEventListener('change', syncGroupScopedOptions);
if (document.getElementById('level_to')) document.getElementById('level_to').addEventListener('change', syncGroupScopedOptions);
syncGroupScopedOptions();
