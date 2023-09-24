/*
  Here are the variables you can modify.

  SHEETS are the sheet names.
  SHEET_CONFIG_VARIABLES are the configuration variables.
  SHEET_MOVE_ORDER is the order of the variable names that'll be shown in the sheet. (for importing)
  SHEET_MOVE_VARIABLES is the variable names 
    
  For SHEET_MOVE_VARIABLES, only change the STRINGs up here, which are surrounded with '' and highlighted in the color red on Google App Scripts.
  If you don't want a value, replace the value to null without the ''.
  
  Make sure there are no duplicate variable names.
*/

const SHEETS = {
  config: 'configuration',
  moves: 'moves',
}

const SHEET_CONFIG_VARIABLES = {
  serverId: 'server_id',
  apiKey: 'api_key',
};

const SHEET_MOVE_VARIABLES = {
  id: 'id',
  name: 'name', 
  description: 'description',
  isHidden: 'hidden',
  image: 'img_url',
  role: 'role',
  moveslot1: null, // 'moveslot_1',
  moveslot2: null, // 'moveslot_2',
  moveslot3: null, // 'moveslot_3',
  moveslot4: null, // 'moveslot_4',
  moveslot5: null, // 'moveslot_5',
  cost: 'cost',
  pp: 'pp',
  chance: 'chance',
  actionsDamageMin: 'dmg_min',
  actionsDamageMax: 'dmg_max',
  actionsDamageChance: 'dmg_chance',
  actionsHealMin: 'heal_min',
  actionsHealMax: 'heal_max',
  actionsHealChance: 'heal_chance',
  actionsDotMin: 'dot_min',
  actionsDotMax: 'dot_max',
  actionsDotChanceSuccess: 'dot_chance',
  actionsDotChanceDecay: 'dot_decay',
  messagesDamageSuccess: null, // 'msg_dmg_success',
  messagesHealSuccess: null, // 'msg_heal_success',
  messagesDotSuccess: null, // 'msg_dot_success',
  messagesDotDamage: null, // 'msg_dot_dmg',
  messagesDotNoEffect: null, // 'msg_dot_noeffect',
  messagesDotDecayed: null, // 'msg_dot_decayed',
};

const SHEET_MOVE_ORDER = [
  'id',
  'name',
  'description',
  'isHidden',
  'image',
  'role',
  // 'moveslot1',
  // 'moveslot2',
  // 'moveslot3',
  // 'moveslot4',
  // 'moveslot5',
  'cost',
  'pp',
  'chance',
  'actionsDamageMin',
  'actionsDamageMax',
  'actionsDamageChance',
  'actionsHealMin',
  'actionsHealMax',
  'actionsHealChance',
  'actionsDotMin',
  'actionsDotMax',
  'actionsDotChanceSuccess',
  'actionsDotChanceDecay',
  // 'messagesDamageSuccess',
  // 'messagesHealSuccess',
  // 'messagesDotSuccess',
  // 'messagesDotDamage',
  // 'messagesDotNoEffect',
  // 'messagesDotDecayed',
];

/* Only edit below if you know what you're doing */

const API_URL = 'https://customrpg.xyz/api';

const spreadsheet = SpreadsheetApp.getActive();
const config = getConfiguration();

if (!config.serverId) throw new Error('Missing server ID');
if (!config.apiKey) throw new Error('Missing API key');

const movesSheet = spreadsheet.getSheetByName(SHEETS.moves);

function onOpen() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const entries = [
    {
      name: "Export moves",
      functionName: "exportDataMoves"
    },
    {
      name: "Import moves",
      functionName: "importDataMoves"
    },
  ];
  sheet.addMenu("Custom RPG", entries);
};

async function exportDataMoves() {
  const moves = transformMoveValues();
  const currentMovesFetch = await fetchApi('/moves');
  if (currentMovesFetch.error !== 'none') return SpreadsheetApp.getUi().alert(currentMovesFetch.textError);
  const currentMoves = currentMovesFetch.moves;
  Utilities.sleep(1000);

  for (const move of moves.sort((a, b) => a.id - b.id)) {
    const currentMove = currentMoves.find(m => m.id === move.id);
    if (
      (SHEET_MOVE_VARIABLES.name ? move.name === currentMove.name : true) &&
      (SHEET_MOVE_VARIABLES.description ? (move.description === currentMove.description || move.description === '' && currentMove.description === 'No description was set for this move yet.') : true) &&
      (SHEET_MOVE_VARIABLES.isHidden ? (move.isHidden || false) === currentMove.isHidden : true) &&
      (SHEET_MOVE_VARIABLES.image ? move.image === currentMove.image : true) &&
      (SHEET_MOVE_VARIABLES.role ? move.role === currentMove.role : true) &&
      (SHEET_MOVE_VARIABLES.moveslot1 ? move.moveslot[0] === currentMove.moveslot[0] : true) &&
      (SHEET_MOVE_VARIABLES.moveslot2 ? move.moveslot[1] === currentMove.moveslot[1] : true) &&
      (SHEET_MOVE_VARIABLES.moveslot3 ? move.moveslot[2] === currentMove.moveslot[2] : true) &&
      (SHEET_MOVE_VARIABLES.moveslot4 ? move.moveslot[3] === currentMove.moveslot[3] : true) &&
      (SHEET_MOVE_VARIABLES.moveslot5 ? move.moveslot[4] === currentMove.moveslot[4] : true) &&
      (SHEET_MOVE_VARIABLES.cost ? move.cost === currentMove.cost : true) &&
      (SHEET_MOVE_VARIABLES.pp ? (move.pp || 0) === (currentMove.pp || 0) : true) &&
      (SHEET_MOVE_VARIABLES.chance ? move.chance === currentMove.chance : true) &&
      (SHEET_MOVE_VARIABLES.actionsDamageMin && move.actions.damage ? move.actions.damage[0] === currentMove.actions.damage[0] : true) &&
      (SHEET_MOVE_VARIABLES.actionsDamageMax && move.actions.damage ? move.actions.damage[1] === currentMove.actions.damage[1] : true) &&
      (SHEET_MOVE_VARIABLES.actionsDamageChance && move.actions.damage ? move.actions.damage[2] === currentMove.actions.damage[2] : true) &&
      (SHEET_MOVE_VARIABLES.actionsHealMin && move.actions.heal ? move.actions.heal[0] === currentMove.actions.heal[0] : true) &&
      (SHEET_MOVE_VARIABLES.actionsHealMax && move.actions.heal ? move.actions.heal[1] === currentMove.actions.heal[1] : true) &&
      (SHEET_MOVE_VARIABLES.actionsHealChance && move.actions.heal ? move.actions.heal[2] === currentMove.actions.heal[2] : true) &&
      (SHEET_MOVE_VARIABLES.actionsDotMin && move.actions.poison ? move.actions.poison[0] === currentMove.actions.poison[0] : true) &&
      (SHEET_MOVE_VARIABLES.actionsDotMax && move.actions.poison ? move.actions.poison[1] === currentMove.actions.poison[1] : true) &&
      (SHEET_MOVE_VARIABLES.actionsDotChanceSuccess && move.actions.poison ? move.actions.poison[2] === currentMove.actions.poison[2] : true) &&
      (SHEET_MOVE_VARIABLES.actionsDotChanceDecay && move.actions.poison ? move.actions.poison[3] === currentMove.actions.poison[3] : true) &&
      (SHEET_MOVE_VARIABLES.messagesDamageSuccess ? move.messages?.damage?.success === currentMove.messages?.damage?.success : true) &&
      (SHEET_MOVE_VARIABLES.messagesHealSuccess ? move.messages?.heal?.success === currentMove.messages?.heal?.success : true) &&
      (SHEET_MOVE_VARIABLES.messagesDotSuccess ? move.messages?.poison?.success === currentMove.messages?.poison?.success : true) &&
      (SHEET_MOVE_VARIABLES.messagesDotDamage ? move.messages?.poison?.damage === currentMove.messages?.poison?.damage : true) &&
      (SHEET_MOVE_VARIABLES.messagesDotNoEffect ? move.messages?.poison?.no_effect === currentMove.messages?.poison?.no_effect : true) &&
      (SHEET_MOVE_VARIABLES.messagesDotDecayed ? move.messages?.poison?.decayed === currentMove.messages?.poison?.decayed : true)
    ) {
      // console.log('Skipped move', move);
    } else {
      const res = await fetchApi(move.id > currentMoves.length ? '/moves/create' : `/moves/modify/${move.id}`, {
        method: 'post',
        payload: JSON.stringify(move)
      });
      console.log(
        'Modifying move',
        move,
        'Result',
        res
      );
      if (res.error !== 'none') return popup('An error has occured.', res.textError);
      Utilities.sleep(1000);
    }
  }
}

async function importDataMoves() {
  const moves = await untransformMoveValues();
  if (!moves) return;

  let moveRow = 1;
  let moveColumn;
  for (const row of moves) {
    moveColumn = 1;
    for (const column of row) {
      movesSheet.getRange(moveRow, moveColumn).setValue(column);
      moveColumn++;
    }
    moveRow++;
  }
}

async function fetchApi(endpoint, data) {
  if (endpoint.startsWith('/')) endpoint = endpoint.slice(1);

  const url = `${API_URL}/${config.serverId}/${endpoint}`;
  const newData = {
    ...data,
    headers: {
      ...data?.headers,
      authorization: `Bearer ${config.apiKey}`,
      'content-type': 'application/json',
    },
  };

  const res = UrlFetchApp.fetch(url, newData);
  return JSON.parse(res.getContentText());
}

function getConfiguration() {
  const configurationSheet = spreadsheet.getSheetByName(SHEETS.config);
  const configurationSheetValues = configurationSheet.getDataRange().getValues();
  return {
    serverId: configurationSheetValues.find(c => c[0] === SHEET_CONFIG_VARIABLES.serverId)[1],
    apiKey: configurationSheetValues.find(c => c[0] === SHEET_CONFIG_VARIABLES.apiKey)[1],
  };
}

function transformMoveValues() {
  const transformed = transformValues(movesSheet);
  const moves = [];

  for (const data of transformed) {
    if (!SHEET_MOVE_VARIABLES.id) throw new Error('Missing ID variable');
    if (!data[SHEET_MOVE_VARIABLES.id]) throw new Error('Missing ID from row');

    moves.push({
      id: data[SHEET_MOVE_VARIABLES.id].toString(),
      name: SHEET_MOVE_VARIABLES.name ? data[SHEET_MOVE_VARIABLES.name].toString() : '',
      description: SHEET_MOVE_VARIABLES.description ? data[SHEET_MOVE_VARIABLES.description].toString() : '',
      isHidden: SHEET_MOVE_VARIABLES.isHidden ? (data[SHEET_MOVE_VARIABLES.isHidden] ?? false) : false,
      image: SHEET_MOVE_VARIABLES.image ? (data[SHEET_MOVE_VARIABLES.image] || null) : null,
      role: SHEET_MOVE_VARIABLES.role ? (data[SHEET_MOVE_VARIABLES.role] || null) : null,
      moveslot: [
        SHEET_MOVE_VARIABLES.moveslot1 ? (data[SHEET_MOVE_VARIABLES.moveslot1] ?? true) : true,
        SHEET_MOVE_VARIABLES.moveslot2 ? (data[SHEET_MOVE_VARIABLES.moveslot2] ?? true) : true,
        SHEET_MOVE_VARIABLES.moveslot3 ? (data[SHEET_MOVE_VARIABLES.moveslot3] ?? true) : true,
        SHEET_MOVE_VARIABLES.moveslot4 ? (data[SHEET_MOVE_VARIABLES.moveslot4] ?? true) : true,
        SHEET_MOVE_VARIABLES.moveslot5 ? (data[SHEET_MOVE_VARIABLES.moveslot5] ?? true) : true,
      ],
      cost: SHEET_MOVE_VARIABLES.cost ? (isNaN(parseInt(data[SHEET_MOVE_VARIABLES.cost])) ? null : parseInt(data[SHEET_MOVE_VARIABLES.cost])) : null,
      pp: SHEET_MOVE_VARIABLES.pp ? (parseInt(data[SHEET_MOVE_VARIABLES.pp]) || 0) : 0,
      chance: SHEET_MOVE_VARIABLES.chance ? (Math.round(parseFloat(data[SHEET_MOVE_VARIABLES.chance]) * 100)) : 100,
      actions: {
        damage:
          SHEET_MOVE_VARIABLES.actionsDamageMin &&
          SHEET_MOVE_VARIABLES.actionsDamageMax &&
          SHEET_MOVE_VARIABLES.actionsDamageChance &&

          data[SHEET_MOVE_VARIABLES.actionsDamageMin] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsDamageMax] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsDamageChance] !== ''
          ? [
            parseInt(data[SHEET_MOVE_VARIABLES.actionsDamageMin]),
            parseInt(data[SHEET_MOVE_VARIABLES.actionsDamageMax]),
            Math.round(parseFloat(data[SHEET_MOVE_VARIABLES.actionsDamageChance]) * 100),
          ] : undefined,
        heal:
          SHEET_MOVE_VARIABLES.actionsHealMin &&
          SHEET_MOVE_VARIABLES.actionsHealMax &&
          SHEET_MOVE_VARIABLES.actionsHealChance &&
          
          data[SHEET_MOVE_VARIABLES.actionsHealMin] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsHealMax] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsHealChance] !== ''
          ? [
            parseInt(data[SHEET_MOVE_VARIABLES.actionsHealMin]),
            parseInt(data[SHEET_MOVE_VARIABLES.actionsHealMax]),
            Math.round(parseFloat(data[SHEET_MOVE_VARIABLES.actionsHealChance]) * 100),
          ] : undefined,
        poison:
          SHEET_MOVE_VARIABLES.actionsDotMin &&
          SHEET_MOVE_VARIABLES.actionsDotMax &&
          SHEET_MOVE_VARIABLES.actionsDotChanceSuccess &&
          SHEET_MOVE_VARIABLES.actionsDotChanceDecay &&
          
          data[SHEET_MOVE_VARIABLES.actionsDotMin] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsDotMax] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsDotChanceSuccess] !== '' &&
          data[SHEET_MOVE_VARIABLES.actionsDotChanceDecay] !== ''
          ? [
            parseInt(data[SHEET_MOVE_VARIABLES.actionsDotMin]),
            parseInt(data[SHEET_MOVE_VARIABLES.actionsDotMax]),
            Math.round(parseFloat(data[SHEET_MOVE_VARIABLES.actionsDotChanceSuccess]) * 100),
            Math.round(parseFloat(data[SHEET_MOVE_VARIABLES.actionsDotChanceDecay]) * 100),
          ] : undefined,
      },
      messages: {
        damage: {
          success: SHEET_MOVE_VARIABLES.messagesDamageSuccess ? (data[SHEET_MOVE_VARIABLES.messagesDamageSuccess] || null) : null,
        },
        heal: {
          success: SHEET_MOVE_VARIABLES.messagesHealSuccess ? (data[SHEET_MOVE_VARIABLES.messagesHealSuccess] || null) : null,
        },
        poison: {
          success: SHEET_MOVE_VARIABLES.messagesDotSuccess ? (data[SHEET_MOVE_VARIABLES.messagesDotSuccess] || null) : null,
          damage: SHEET_MOVE_VARIABLES.messagesDotDamage ? (data[SHEET_MOVE_VARIABLES.messagesDotDamage] || null) : null,
          no_effect: SHEET_MOVE_VARIABLES.messagesDotNoEffect ? (data[SHEET_MOVE_VARIABLES.messagesDotNoEffect] || null) : null,
          decayed: SHEET_MOVE_VARIABLES.messagesDotDecayed ? (data[SHEET_MOVE_VARIABLES.messagesDotDecayed] || null) : null,
        },
      },
    });
  }
  return moves;
}

async function untransformMoveValues() {
  const res = await fetchApi('/moves');
  if (res.error !== 'none') {
    SpreadsheetApp.getUi().alert(res.textError);
    return null;
  }

  const transformed = [];
  const { moves } = res; 
  for (const move of moves) {
    const untransformed = {};
    for (const variableName of SHEET_MOVE_ORDER) {
      if (SHEET_MOVE_VARIABLES[variableName]) {
        let value;
        switch(variableName) {
          case 'moveslot1':
            value = move.moveslot[0];
            break;
          case 'moveslot2':
            value = move.moveslot[1];
            break;
          case 'moveslot3':
            value = move.moveslot[2];
            break;
          case 'moveslot4':
            value = move.moveslot[3];
            break;
          case 'moveslot5':
            value = move.moveslot[4];
            break;
          case 'chance':
            value = move.chance / 100;
            break;
          case 'actionsDamageMin':
            value = move.actions.damage ? move.actions.damage[0] : '';
            break;
          case 'actionsDamageMax':
            value = move.actions.damage ? move.actions.damage[1] : '';
            break;
          case 'actionsDamageChance':
            value = move.actions.damage ? (move.actions.damage[2] / 100) : '';
            break;
          case 'actionsHealMin':
            value = move.actions.heal ? move.actions.heal[0] : '';
            break;
          case 'actionsHealMax':
            value = move.actions.heal ? move.actions.heal[1] : '';
            break;
          case 'actionsHealChance':
            value = move.actions.heal ? (move.actions.heal[2] / 100) : '';
            break;
          case 'actionsDotMin':
            value = move.actions.poison ? move.actions.poison[0] : '';
            break;
          case 'actionsDotMax':
            value = move.actions.poison ? move.actions.poison[1] : '';
            break;
          case 'actionsDotChanceSuccess':
            value = move.actions.poison ? (move.actions.poison[2] / 100) : '';
            break;
          case 'actionsDotChanceDecay':
            value = move.actions.poison ? (move.actions.poison[3] / 100) : '';
            break;
          case 'messagesDamageSuccess':
            value = move.messages?.damage?.success;
            break;
          case 'messagesHealSuccess':
            value = move.messages?.heal?.success;
            break;
          case 'messagesDotSuccess':
            value = move.messages?.poison?.success;
            break;
          case 'messagesDotDamage':
            value = move.messages?.poison?.damage;
            break;
          case 'messagesDotNoEffect':
            value = move.messages?.poison?.no_effect;
            break;
          case 'messagesDotDecayed':
            value = move.messages?.poison?.decayed;
            break;
          default:
            value = move[variableName];
            break;
        }
        untransformed[SHEET_MOVE_VARIABLES[variableName]] = value;
      }
    }
    transformed.push(untransformed);
  }
  return untransformValues(transformed);
}

function transformValues(sheet) {
  const rows = sheet.getDataRange().getValues();
  const variables = rows.shift();

  const transformed = [];

  for (const row of rows) {
    let i = 0;
    const transform = {};
    for (const column of row) {
      transform[variables[i]] = column;
      i++;
    }
    if (!transform.id) throw new Error('Missing ID');
    transformed.push(transform);
  }

  return transformed;
}

function untransformValues(transformed) {
  const order = SHEET_MOVE_ORDER.map(r => SHEET_MOVE_VARIABLES[r]);
  const original = [order];
  for (const transform of transformed) {
    const row = (new Array(order.length)).map(v => '');
    for (const [key, value] of Object.entries(transform)) {
      switch (typeof value) {
        case 'string':
        case 'boolean':
        case 'number':
          row[order.indexOf(key)] = value;
          break;
        default:
          row[order.indexOf(key)] = value || '';
          break;
      }
    }
    original.push(row);
  }
  return original;
}

// Fork of https://stackoverflow.com/questions/62615708/why-cant-i-log-the-output-into-logger-of-google-sheets
function popup(title, product) {
  const html = `<!DOCTYPE html><html><body>${product}</body></html>`;
  SpreadsheetApp.getUi().showModelessDialog(HtmlService.createHtmlOutput(html), title);
}
