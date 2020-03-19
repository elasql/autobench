const assert = require('chai').assert;
const {
  Properties,
  genPropertiestMap,
  overrideProperties,
  setPaths,
  setConnectionsProperties,
  setElasqlProperties
} = require('../../src/preparation/properties');

const { loadToml } = require('../../src/utils');
const { normalLoad } = require('../../src/preparation/parameter-loader');

describe('Properties', () => {
  const propertiesPath = './test/test-properties/vanilladb.properties';
  const prop = new Properties('org.vanilladb.core.config.file', propertiesPath);

  describe('constructor', () => {
    it('should initialize with corret values and types', () => {
      assert.equal(prop.id, 'org.vanilladb.core.config.file');
      assert.equal(prop.fileName, propertiesPath);
      assert.equal(prop.baseName, 'vanilladb');
    });

    it('should throw an error if pass id in type of number', () => {
      assert.throws(() => new Properties(1, propertiesPath), Error, 'id should be type of string');
    });
  });

  const property = 'org.vanilladb.core.util.Profiler.DEPTH';

  describe('get', () => {
    it('should correctly get the value', () => {
      const actual = prop.get(property);
      assert.equal(actual, '4');
    });

    it('should throw an error if passing a nonexistent properties', () => {
      assert.throws(() => { prop.get('nonexistent property'); }, Error, `cannot find the property: nonexistent property in ./test/test-properties/vanilladb.properties`);
    });
  });

  describe('set', () => {
    it('should correctly set the value', () => {
      // before
      assert.equal(prop.properties[property], '4');

      prop.set(property, '6');

      // after
      assert.equal(prop.properties[property], '6');
    });

    it('should throw an error if passing a non-string value', () => {
      const value = 6;
      assert.throws(() => { prop.set(property, value); }, Error, `value ${value} is not in string type`);
    });
  });

  describe('convertObjectToPropertiesText', () => {
    const text = prop.convertObjectToPropertiesText();
    it('should return a string', () => {
      assert.isString(text);
    });

    it('should return an expected value', () => {
      const expected = `org.vanilladb.core.storage.file.Page.BLOCK_SIZE=4096
org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR=
org.vanilladb.core.storage.file.FileMgr.LOG_FILES_DIR=
org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT=false
org.vanilladb.core.storage.buffer.BufferMgr.MAX_TIME=10000
org.vanilladb.core.storage.buffer.BufferMgr.EPSILON=50
org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE=102400
org.vanilladb.core.storage.log.LogMgr.LOG_FILE=vanilladb.log
org.vanilladb.core.storage.tx.concurrency.LockTable.MAX_TIME=10000
org.vanilladb.core.storage.tx.concurrency.LockTable.EPSILON=50
org.vanilladb.core.server.VanillaDb.DO_CHECKPOINT=false
org.vanilladb.core.storage.tx.recovery.CheckpointTask.TX_COUNT_TO_CHECKPOINT=1000
org.vanilladb.core.storage.tx.recovery.CheckpointTask.MY_METHOD=0
org.vanilladb.core.storage.tx.recovery.CheckpointTask.PERIOD=300000
org.vanilladb.core.storage.tx.TransactionMgr.SERIALIZABLE_CONCUR_MGR=org.elasql.storage.tx.concurrency.ConservativeOrderedCcMgr
org.vanilladb.core.storage.tx.TransactionMgr.REPEATABLE_READ_CONCUR_MGR=org.elasql.storage.tx.concurrency.ConservativeOrderedCcMgr
org.vanilladb.core.storage.tx.TransactionMgr.READ_COMMITTED_CONCUR_MGR=org.elasql.storage.tx.concurrency.ConservativeOrderedCcMgr
org.vanilladb.core.storage.tx.TransactionMgr.RECOVERY_MGR=org.vanilladb.core.storage.tx.recovery.RecoveryMgr
org.vanilladb.core.storage.metadata.TableMgr.MAX_NAME=30
org.vanilladb.core.storage.metadata.ViewMgr.MAX_VIEWDEF=150
org.vanilladb.core.storage.metadata.statistics.StatMgr.REFRESH_THRESHOLD=0
org.vanilladb.core.storage.metadata.statistics.StatMgr.NUM_BUCKETS=20
org.vanilladb.core.storage.metadata.statistics.StatMgr.NUM_PERCENTILES=5
org.vanilladb.core.storage.metadata.statistics.SampledHistogramBuilder.MAX_SAMPLES=1000
org.vanilladb.core.storage.index.hash.HashIndex.NUM_BUCKETS=100
org.vanilladb.core.sql.VarcharType.CHAR_SET=UTF-8
org.vanilladb.core.query.parse.Parser.DEFAULT_INDEX_TYPE=1
org.vanilladb.core.remote.jdbc.RemoteConnectionImpl.DEFAULT_ISOLATION_LEVEL=8
org.vanilladb.core.server.VanillaDb.QUERYPLANNER=org.vanilladb.core.query.planner.opt.HeuristicQueryPlanner
org.vanilladb.core.server.VanillaDb.UPDATEPLANNER=org.vanilladb.core.query.planner.index.IndexUpdatePlanner
org.vanilladb.core.server.VanillaDb.PROFILE_OUTPUT_DIR=
org.vanilladb.core.server.task.TaskMgr.THREAD_POOL_SIZE=1000
org.vanilladb.core.util.Profiler.INTERVAL=3
org.vanilladb.core.util.Profiler.DEPTH=4
org.vanilladb.core.util.Profiler.MAX_PACKAGES=100
org.vanilladb.core.util.Profiler.MAX_METHODS=1000
org.vanilladb.core.util.Profiler.MAX_LINES=1000
`;
      assert.equal(text, expected);
    });
  });
});

describe('genPropertiesMap', () => {
  const propMap = genPropertiestMap('./test/test-properties');
  it('should return an object', () => {
    assert.isObject(propMap);
  });

  it('should contain instance of Properties', () => {
    Object.keys(propMap).map(key => {
      assert.instanceOf(propMap[key], Properties);
    });
  });
});

describe('overrrideProperties', () => {
  const propMap = genPropertiestMap('./test/test-properties');
  const notComb = loadToml('./test/test-toml/parameter.test.toml');
  const params = normalLoad(notComb);
  const benchParam = params[0];

  it('should override properties correctly', () => {
    overrideProperties(propMap, benchParam);
    assert.equal(propMap.vanilladb.properties['org.vanilladb.core.storage.buffer.BufferMgr.BUFFER_POOL_SIZE'], '1024000');
    assert.equal(propMap.vanilladb.properties['org.vanilladb.core.storage.file.io.IoAllocator.USE_O_DIRECT'], 'true');
  });
});

describe('setPaths', () => {
  const propMap = genPropertiestMap('./test/test-properties');

  it('should set path correctly', () => {
    assert.equal(propMap.vanilladb.get('org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR'), '');
    assert.equal(propMap.vanillabench.get('org.vanilladb.bench.StatisticMgr.OUTPUT_DIR'), '');

    setPaths(propMap, 'dbDir', 'resultDir');

    assert.equal(propMap.vanilladb.get('org.vanilladb.core.storage.file.FileMgr.DB_FILES_DIR'), 'dbDir');
    assert.equal(propMap.vanillabench.get('org.vanilladb.bench.StatisticMgr.OUTPUT_DIR'), 'resultDir');
  });
});

describe('setConnectionsProperties', () => {
  const propMap = genPropertiestMap('./test/test-properties');

  it('should set connection properties correctly', () => {
    assert.equal(
      propMap.vanilladbcomm.get('org.vanilladb.comm.server.ServerAppl.SERVER_VIEW'),
      '0 127.0.0.1 42961'
    );
    assert.equal(
      propMap.vanilladbcomm.get('org.vanilladb.comm.client.ClientAppl.CLIENT_VIEW'),
      '0 127.0.0.1 30000'
    );
    assert.equal(
      propMap.vanilladbcomm.get('org.vanilladb.comm.server.ServerAppl.STAND_ALONE_SEQUENCER'),
      'true'
    );

    setConnectionsProperties(propMap, 'serverView', 'clientView', false);

    assert.equal(
      propMap.vanilladbcomm.get('org.vanilladb.comm.server.ServerAppl.SERVER_VIEW'),
      'serverView'
    );
    assert.equal(
      propMap.vanilladbcomm.get('org.vanilladb.comm.client.ClientAppl.CLIENT_VIEW'),
      'clientView'
    );
    assert.equal(
      propMap.vanilladbcomm.get('org.vanilladb.comm.server.ServerAppl.STAND_ALONE_SEQUENCER'),
      'false'
    );
  });

  it('should throw an error if isSequencer is not type of boolean', () => {
    assert.throws(() => { setConnectionsProperties(propMap, 'serverView', 'clientView', 'false'); }, Error, 'isSequencer should be type of boolean');
  });
});

describe('setElasqlProperties', () => {
  const propMap = genPropertiestMap('./test/test-properties');

  it('should set elasql properties correctly', () => {
    assert.equal(propMap.elasql.get('org.elasql.storage.metadata.PartitionMetaMgr.NUM_PARTITIONS'), '2');

    setElasqlProperties(propMap, '87');

    assert.equal(propMap.elasql.get('org.elasql.storage.metadata.PartitionMetaMgr.NUM_PARTITIONS'), '87');
  });

  it('should throw an error if serverCount is not type of string', () => {
    assert.throws(() => { setElasqlProperties(propMap, 87); }, Error, 'serverCount should be type of string');
  });
});
