/**
 * Created with JetBrains WebStorm.
 * User: eSage
 * Date: 18-4-10
 * Time: 下午11:37
 * Description: daily report task
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Model = require('../common/mongodb').Task;
const utils = require('../common/utils');

const defaultOptions = {
  priority: 5,
  type: 0,
  // progress: 0,
  status: 0,
  hierarchies: 1,
  detail: '',
  parent_id: '',
  real_cost: 0,
  daily_cost: {},
  date_format: 'yyyy-MM-hh',
  projection: {creator: 0, modifier: 0, modify_time: 0, __v: 0},
  code2: {code: 2, msg: 'params error'},
  code4: {code: 4, msg: 'data error'}
};

/**
 * _save
 * the function save() return is a promise, but package this order to keep with other function
 *
 * @param entity
 */
const _save = function (entity) {
  return new Promise((resolve, reject) => {
    // todo when I use Model.save(), it tips "TypeError: Model.save is not a function"??
    Model.create(entity).then(doc => {
      resolve(doc);
    }).catch(err => {
      reject(err);
    })
  })
};
/**
 * _remove
 * package Model.remove <return Query> to Promise
 *
 * @param conditions
 */
const _remove = function (conditions) {
  return new Promise((resolve, reject) => {
    Model.remove(conditions, (err, status) => {
      if (err) {
        reject(err);
      } else {
        resolve(status);
      }
    })
  })
};
/**
 * _findByIdAndRemove
 * package Model.findByIdAndRemove <return Query> to Promise
 *
 * @param id
 * @param options
 */
const _findByIdAndRemove = function (id, options = null) {
  return new Promise((resolve, reject) => {
    Model.findByIdAndRemove(id, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })
};
/**
 * _update
 * package Model.update <return Query> to Promise
 *
 * @param conditions
 * @param doc
 * @param options
 */
const _update = function (conditions, doc, options = null) {
  return new Promise((resolve, reject) => {
    Model.update(conditions, doc, options, (err, raw) => {
      if (err) {
        reject(err);
      } else {
        resolve(raw);
      }
    })
  })
};
/**
 * _find
 * package Model.find <return Query> to Promise
 *
 * @param conditions
 * @param projection
 * @param options
 */
const _find = function (conditions = {}, projection = defaultOptions.projection, options = null) {
  return new Promise(function (resolve, reject) {
    Model.find(conditions, projection, options, function (err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    })
  })
};
/**
 * _findById
 * package Model.findById <return Query> to Promise
 *
 * @param id
 * @param projection
 * @param options
 */
const _findById = function (id, projection = defaultOptions.projection, options = null) {
  return new Promise((resolve, reject) => {
    Model.findById(id, projection, options, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    })
  })
};

const addTask = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let task = {};
    task.user_id = req.param('userId') || '';
    task.title = req.param('title') || '';
    // todo 预期耗时？？？
    task.expect_cost = req.param('expectCost') || '';
    if (!task.user_id || !task.title || !task.expect_cost) {
      resolve(defaultOptions.code2);
    } else {
      task._id = new mongoose.Types.ObjectId;
      task.parent_id = req.param('parentId') || defaultOptions.parent_id;
      task.detail = req.param('detail') || defaultOptions.detail;
      task.type = req.param('type') || defaultOptions.type;
      // task.progress = req.param('progress') || defaultOptions.progress;
      task.real_cost = req.param('realCost') || defaultOptions.real_cost;
      task.daily_cost = req.param('dailyCost') || defaultOptions.daily_cost;
      task.priority = req.param('priority') || defaultOptions.priority;
      task.status = req.param('status') || defaultOptions.status;
      task.hierarchies = req.param('hierarchies') || defaultOptions.hierarchies;
      if (req.param('startTime')) {
        task.start_time = req.param('startTime');
      }
      if (req.param('endTime')) {
        task.end_time = req.param('endTime');
      }
      _save(task).then(doc => {
        console.log(doc);
        ret.code = 0;
        ret.msg = 'success';
        resolve(ret);
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'add task failed';
        resolve(ret);
      })
    }
  })
};
// todo 假删除
const deleteById = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let id = req.param('id');
    if (!id) {
      resolve(defaultOptions.code2);
    } else {
      _findByIdAndRemove(id).then(() => {
        ret.code = 0;
        ret.msg = 'success';
        resolve(ret);
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'delete user failed';
        resolve(ret);
      })
    }
  })
};
const deleteTasks = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let idList = req.param('ids');
    if (!Array.isArray(idList)) {
      resolve(defaultOptions.code2);
    } else {
      _remove({_id: {$in: idList}}).then(status => {
        if (status && status.n > 0) {
          ret.code = 0;
          ret.msg = 'success';
          ret.count = status.n;
          resolve(ret);
        } else {
          console.error('no task has been deleted');
          ret.code = 1;
          ret.msg = 'delete tasks failed';
          resolve(ret);
        }
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'delete tasks failed';
        resolve(ret);
      })
    }
  })
};
const updateTask = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let newTask = {};
    let id = req.param('id') || '';
    if (!id) {
      resolve(defaultOptions.code2);
    } else {
      _findById(id).then(oldTask => {
        let title = req.param('title');
        let detail = req.param('detail');
        // let progress = req.param('progress');
        let priority = req.param('priority');
        let status = req.param('status');
        // number
        let today_cost = req.param('dailyCost');
        let today = req.param('today');
        let dailyCosts = oldTask.daily_cost;
        // let oldProcess = oldTask.progress;
        let now = today || new Date();
        if (title) {
          newTask.title = title;
        }
        if (detail) {
          newTask.detail = detail;
        }
        if (priority) {
          newTask.priority = priority;
        }
        if (status) {
          newTask.status = status;
          if (status === 2) {
            newTask.end_time = now;
          }
        }
        if (today_cost) {
          let todayFmt = utils.dateFormat(new Date(now), defaultOptions.date_format);
          if (!dailyCosts || typeof dailyCosts !== 'object') {
            dailyCosts = {};
          } else {
            newTask.real_cost = today_cost;
            for (let daily in dailyCosts) {
              if (dailyCosts.hasOwnProperty(daily)) {
                newTask.real_cost += dailyCosts[daily];
              }
            }
          }
          dailyCosts[todayFmt] = today_cost;
          newTask.daily_cost = dailyCosts;
        }
        newTask.modify_time = new Date();
        _update({_id: id}, {$set: newTask}).then(status => {
          if (status.nModified > 0) {
            ret.code = 0;
            ret.msg = 'success';
            resolve(ret);
          } else {
            console.error('no task has updated');
            ret.code = 1;
            ret.msg = 'update failed';
            resolve(ret);
          }
        }).catch(err => {
          console.error(err);
          ret.code = 1;
          ret.msg = 'update failed';
          resolve(ret);
        })
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'not find this task, update failed';
        resolve(ret);
      })
    }
  })
};
const updateTreeStatus = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let newTask = {};
    let id = req.param('id');
    let parent_id = req.param('parentId');
    let hierarchies = req.param('hierarchies');
    let type = req.param('type');
    if (!id) {
      resolve(defaultOptions.code2);
    } else {
      _findById(id).then(oldTask => {
        let oldType = oldTask.type;
        if (parent_id) {
          newTask.parent_id = parent_id;
        }
        if (hierarchies) {
          newTask.hierarchies = hierarchies;
        }
        if (type) {
          newTask.type = type;
          if (type === '2' && oldType !== 2) {
            newTask.start_time = new Date();
          } else if (type !== '2' && oldType === 2) {
            // 不应该出现这种情况
            console.error('data error _id: ' + id);
          }
        }
        _update({_id: id}, {$set: newTask}).then(raw => {
          if (raw.nModified > 0) {
            ret.code = 0;
            ret.msg = 'success';
            resolve(ret);
          } else {
            console.error('no task has updated');
            ret.code = 1;
            ret.msg = 'update task failed';
            resolve(ret);
          }
         }).catch(errUpdate => {
          console.error(errUpdate);
          ret.code = 1;
          ret.msg = 'update task failed';
          resolve(ret);
        })
      }).catch(errFind => {
        console.error(errFind);
        ret.code = 1;
        ret.msg = 'update task failed';
        resolve(ret);
      })
    }
  })
};
const findAll = function () {
  return new Promise(resolve => {
    let ret = {};
    _find().then(docs => {
      ret.code = 0;
      ret.msg = 'success';
      ret.data = docs;
      resolve(ret);
    }).catch(err => {
      console.error(err);
      ret.code = 1;
      ret.msg = 'get tasks failed';
      resolve(ret);
    })
  })
};
const findById = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let id = req.param('id');
    if (!id) {
      resolve(defaultOptions.code2);
    } else {
      _findById(id).then(doc => {
        ret.code = 0;
        ret.msg = 'success';
        ret.data = doc;
        resolve(doc);
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'get task failed';
        resolve(ret);
      })
    }
  })
};
const findByUserId = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let user_id = req.param('userId');
    if (!user_id) {
      resolve(defaultOptions.code2);
    } else {
      _find({user_id: user_id}).then(docs => {
        try {
          // 这里使用JSON格式化数据并解析，是为了过滤掉docs对象中的其他属性和方法，方便后面添加children属性
          docs = JSON.parse(JSON.stringify(docs));
        } catch (e) {
          docs = [];
        }
        let taskTree = [];
        let children = {};
        // todo 数据处理不够严谨，要保证数据层级和父子关系对应
        docs.sort((a, b) => {
          return (b.hierarchies === a.hierarchies && b.create_time < a.create_time ) || (b.hierarchies - a.hierarchies);
        });
        docs.forEach( doc => {
          doc.childNodes  = [];
          if (children.hasOwnProperty(doc._id)) {
            doc.childNodes = children[doc._id];
          }
          if (!doc.parent_id && doc.hierarchies === 1) {
            taskTree.unshift(doc);
          } else if (children.hasOwnProperty(doc.parent_id)) {
            children[doc.parent_id].unshift(doc);
          } else if (doc.parent_id) {
            children[doc.parent_id] = [doc];
          } else {
            console.error('数据异常');
            console.error('_id: ' + doc._id);
          }
        });
        ret.code = 0;
        ret.msg = 'success';
        ret.data  = taskTree;
        resolve(ret)
      }).catch(err => {
        console.error(err);
        ret.code = 0;
        ret.msg = 'get tasks failed';
        resolve(ret);
      })
    }
  })
};

/* GET task page. */
router.get('/', (req, res) => {

});

router.post('/add', (req, res) => {
  addTask(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});
// /remove  by id
router.get('/delete', (req, res) => {
  deleteById(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});
// post
router.post('/deleteBatch', (req, res) => {
  deleteTasks(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});
// update  by id ***
router.post('/update', (req, res) => {
  updateTask(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});
// update parent
router.post('/updateTreeStatus', (req, res) => {
  updateTreeStatus(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});
// /all
router.get('/all', (req, res) => {
  findAll().then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

router.get('/findById', (req, res) => {
  findById(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

router.get('/allByUser', (req, res) => {
  findByUserId(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

module.exports = router;