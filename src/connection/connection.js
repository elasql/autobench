const Action = {
  loading: 1,
  benchmarking: 2
};

const INIT_PORT = 30000;
class Connection {
  // use default port number if user doesn't provide it
  constructor (initPort = INIT_PORT) {
    this.initPort = initPort;
  }

  getConnList (ips, totalConn, maxConnPerNode) {
    if (!Number.isInteger(totalConn)) {
      throw Error(`totalConn is not a Integer, you pass ${totalConn} to getConnList`);
    }
    const nodeNum = ips.length;
    const connPerNode = Math.ceil(totalConn / nodeNum);
    if (connPerNode > maxConnPerNode) {
      throw Error('The number of machines is not enough');
    }

    let id = 0;
    const conns = [];

    // slice will return a new array(shallow copy)
    // connPerNodeArr looks like [1, 2, 3, ... connPerNode]
    const connPerNodeArr = [...Array(connPerNode + 1).keys()].slice(1);

    connPerNodeArr.map(currentConnPerNode => {
      ips.map(ip => {
        if (id >= totalConn) {
          return;
        }
        const port = this.initPort + currentConnPerNode - 1;
        conns.push(Connection.getConn(id, ip, port));
        id += 1;
      });
    });

    return conns;
  }

  static getConn (id, ip, port) {
    return {
      id,
      ip,
      port
    };
  }
}

const ShellCmd = require('../shell-cmd');
const { exec } = require('../child-process');

// We need this class because both server and client will use these methods
// Don't write the similar code in those two files, it is hard to maintain
class ConnectionLog {
  constructor (shellCmd, logPath, id, isServer) {
    this.shellCmd = shellCmd;
    this.logPath = logPath;
    this.id = id;
    this.prefix = isServer ? 'server' : 'client';
  }

  async grepLog (keyword) {
    const grep = ShellCmd.getGrep(keyword, this.logPath);
    const ssh = this.shellCmd.getSsh(grep);
    // Don't try catch here, let the outside function to handle
    const promisedObj = await exec(ssh);
    return promisedObj;
  }

  async grepError (keyword) {
    let result;
    try {
      result = await this.grepLog(keyword);
    } catch (err) {
      if (err.code === 1) {
        // return if grep nothing
        return;
      }
      throw Error(err.stderr);
    }
    const { stdout } = result;
    throw Error(`${this.prefix} ${this.id} error: ${stdout}`);
  }
}

module.exports = {
  Action: Action,
  Connection: Connection,
  ConnectionLog: ConnectionLog
};