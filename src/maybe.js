const debug = require('debug')('node-7z')
const { STAGE_HEADERS, STAGE_BODY, STAGE_FOOTERS } = require('./references')

const info = (stream, line) => {
  const stageWithInfo = (stream._stage === STAGE_HEADERS || stream._stage === STAGE_FOOTERS)
  if (!stageWithInfo) {
    return false
  } else {
    const infos = stream._matchInfos(stream, line)
    if (!infos) {
      return false
    } else {
      stream.info = new Map([...stream.info, ...infos])
      return true
    }
  }
}

const progress = (stream, line) => {
  const progress = stream._matchProgress(stream, line)
  if (!progress) {
    return false
  } else {
    debug('progress: %o', progress)
    stream.emit('progress', progress)
    return true
  }
}

const endOfHeaders = (stream, line) => {
  if (stream._stage !== STAGE_HEADERS) {
    return false
  } else {
    const match = stream._matchEndOfHeaders(stream, line)
    if (!match) {
      return false
    } else {
      debug('stream: END_OF_HEADERS')
      stream._stage = STAGE_BODY
      return true
    }
  }
}

const endOfBody = (stream, line) => {
  const match = stream._matchEndOfBody(stream, line)
  if (!match) {
    return false
  } else {
    debug('stream: END_OF_BODY')
    stream._stage = STAGE_FOOTERS
    return true
  }
}

const bodyData = (stream, line) => {
  const match = stream._matchBodyData(stream, line)
  if (!match) {
    return false
  } else {
    stream._stage = STAGE_BODY
    debug('data: %o', match)
    stream.push(match)
    return true
  }
}

module.exports = { info, progress, endOfHeaders, endOfBody, bodyData }
