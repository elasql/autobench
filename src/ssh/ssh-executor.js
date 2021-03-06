/* Reference:
 https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
*/
const util = require('util');
const childProcessExec = util.promisify(require('child_process').exec);

// TODO: rename this class to cmd-executor!!!

// return a promise
async function exec (cmd) {
/*
  if childProcessExec is resolved
  return {
    stdout:'...',
    stderr:''
  }

  else return {
    killed: false,
    code: 1,
    signal: null,
    cmd: 'your cmd',
    stdout: '',
    stderr: '...'
  }

  PLEASE DO NOT TRY CATCH childProcessExec !!!!!

  A lot of functions depend on the returned values and errors of childProcessExec,
  If you either catch the errors in this function or don't return the resolve result.
  It will cause a disaster.
  */
  const resolveResult = await childProcessExec(cmd);
  return resolveResult;
};

module.exports = {
  exec
};
