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

const defaultOptions = {
  priority: 5,
  type: 0,
  progress: 0,
  status: 0,
  hierarchies: 0,
  detail: '',
  parent_id: '',
  real_cost: '',
  daily_cost: [],
  projection: {},
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
 * package User.remove <return Query> to Promise
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
 * _update
 * package User.update <return Query> to Promise
 *
 * @param conditions
 * @param doc
 * @param option
 */
const _update = function (conditions, doc, option = null) {
  return new Promise((resolve, reject) => {
    Model.update(conditions, doc, option, (err, raw) => {
      if (err) {
        reject(err);
      } else {
        resolve(raw);
      }
    })
  })
};
/**
 * _findByIdAndRemove
 * package User.findByIdAndRemove <return Query> to Promise
 *
 * @param id
 * @param option
 */
const _findByIdAndRemove = function (id, option = null) {
  return new Promise((resolve, reject) => {
    Model.findByIdAndRemove(id, option, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })
};
/**
 * _find
 * package User.find <return Query> to Promise
 *
 * @param conditions
 * @param projection
 * @param option
 */
const _find = function (conditions = {}, projection = defaultOptions.projection, option = null) {
  return new Promise(function (resolve, reject) {
    Model.find(conditions, projection, option, function (err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    })
  })
};

const addTask = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let task = {};
    let user_id = req.param('userId');
    let parent_id = req.param('parentId');
    let title = req.param('title');
    let detail = req.param('detail');
    let type = req.param('type');
    let progress = req.param('progress');
    let expect_cost = req.param('expectCost');
    let real_cost = req.param('realCost');
    let daily_cost = req.param('dailyCost');
    let priority = req.param('priority');
    let status = req.param('status');
    let hierarchies = req.param('hierarchies');
    let start_time = req.param('startTime');
    let end_time = req.param('endTime');
    if (!user_id || !title || !expect_cost) {
      resolve(defaultOptions.code2);
    } else {
      task._id = new mongoose.Types.ObjectId;
      task.user_id = user_id;
      task.title = title;
      task.expect_cost = expect_cost;
      task.parent_id = parent_id ? parent_id : defaultOptions.parent_id;
      task.detail = detail ? detail : defaultOptions.detail;
      task.type = type ? type : defaultOptions.type;
      task.progress = progress ? progress : defaultOptions.progress;
      task.real_cost = real_cost ? real_cost : defaultOptions.real_cost;
      task.daily_cost = daily_cost ? daily_cost : defaultOptions.daily_cost;
      task.priority = priority ? priority : defaultOptions.priority;
      task.status = status ? status : defaultOptions.status;
      task.hierarchies = hierarchies ? hierarchies : defaultOptions.hierarchies;
      if (start_time) {
        task.start_time = start_time;
      }
      if (end_time) {
        task.end_time = end_time;
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

/* GET task page. */
router.get('/', (req, res) => {

});

// todo post
router.get('/add', (req, res) => {
  addTask(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});
// /add doc
// /remove  by id
// /update  by id ***
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

module.exports = router;
