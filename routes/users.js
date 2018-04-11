/**
 * Created with JetBrains WebStorm.
 * User: eSage
 * Date: 18-4-7
 * Time: 下午11:37
 * Description: daily report task
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Model = require('../common/mongodb').User;

const defaultOptions = {
  projection: {account: 1, _id: 1, role: 1, modify_time: 1, password: 1},
  // 0: admin 1: user
  roles: [0, 1],
  role_admin: 0,
  role_user: 1,
 // ret:[0: 操作成功, 1: 操作失败, 2: 参数错误, 3: 业务错误, 4: JSON序列化失败，数据格式错误]
  code4: {code: 4, msg: 'data error'},
  code2: {code: 2, msg: 'params error'}
};

// todo model api
// todo all tips
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

/**
 * addUser
 * common function
 *
 * @param req
 * @param role
 */
const addUser = function (req, role) {
  return new Promise(resolve => {
    let ret = {};
    let userDoc = {};
    // req.query.account req.query.password
    let account = req.param('account');
    let password = req.param('password');
    // todo 参数校验
    if (!account || !password) {
      resolve(defaultOptions.code2);
    } else {
      // 判断帐号是否存在
      _find({account: account}).then(function (user) {
        if (user.length > 0) {
          ret.code = 3;
          ret.msg = 'account already exist';
          resolve(ret);
        } else {
          userDoc._id = new mongoose.Types.ObjectId();
          userDoc.account = account;
          userDoc.password = password;
          userDoc.role = role;
          _save(userDoc).then(function (docs) {
            ret.code = 0;
            ret.msg = 'success';
            resolve(ret);
          }).catch(function (err) {
            console.error(err);
            ret.code = 1;
            ret.msg = 'add users failed';
            resolve(ret);
          })
        }
      }).catch(function (findErr) {
        console.error(findErr);
        ret.code = 1;
        ret.msg = 'add users failed';
        resolve(ret);
      });
    }
  });
};
/**
 * findAllByRole
 * find users by role
 *
 * @param req
 */
const findAllByRole = function (req) {
  return new Promise(resolve => {
    let ret = {};
    // let role = req.query.role;
    let role = req.param('role');
    if (!role || defaultOptions.roles.indexOf(Number(role)) === -1) {
      resolve(defaultOptions.code2);
    } else {
      _find({role: role}).then(function (docs) {
        ret.code = 0;
        ret.msg = 'success';
        ret.data = docs;
        resolve(ret);
      }).catch(function (err) {
        console.error(err);
        ret.code = 1;
        ret.msg = 'get users failed';
        resolve(ret);
      })
    }
  })
};
/**
 * checkAccountAndPwd
 * check login
 *
 * @param req
 */
const checkAccountAndPwd = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let account = req.param('account');
    let password = req.param('password');
    if (!account || !password) {
      resolve(defaultOptions.code2);
    } else {
      _find({account: account, password: password}).then(function (doc) {
        ret.code = 0;
        ret.msg = 'success';
        ret.data = doc;
        resolve(ret);
      }).catch(function (err) {
        console.error(err);
        ret.code = 1;
        ret.msg = 'account or password error';
        resolve(ret);
      });
    }
  })
};
/**
 * findAllUser
 * query all users
 *
 */
const findAllUser = function () {
  return new Promise(resolve => {
    let ret = {};
    _find().then(function (docs) {
      ret.code = 0;
      ret.msg = 'success';
      ret.data = docs;
      resolve(ret);
    }).catch(function (err) {
      console.error(err);
      ret.code = 1;
      ret.msg = 'get users failed';
      resolve(ret);
    })
  })
};
/**
 * deleteUserById
 *
 * @param req
 */
const deleteUserById = function (req) {
  return new Promise(resolve => {
    let ret = {};
    // let id = req.query.id;
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
/**
 * deleteUsers
 * delete users by conditions
 *
 * @param req
 */
const deleteUsers = function (req) {
  return new Promise(resolve => {
    let ret = {};
    // let idList = req.body.ids;
    let idList = req.param('ids');
    if (!Array.isArray(idList)) {
      resolve(defaultOptions.code2);
    } else {
      _remove({_id: {$in: idList}}).then((status) => {
        if (status && status.n > 0) {
          ret.code = 0;
          ret.msg = 'success';
          ret.count = status.n;
          resolve(ret);
        } else {
          console.error('no user has deleted');
          ret.code = 1;
          ret.msg = 'delete users failed';
          resolve(ret);
        }
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'delete users failed';
        resolve(ret);
      })
    }
  })
};
/**
 * updateUser
 * update user password only
 *
 * @param req
 */
const updateUser = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let id = req.param('id');
    let account = req.param('account');
    let password = req.param('password');
    if (!password) {
      resolve(defaultOptions.code2);
    } else {
      let conditions = {$or: [{_id: id}, {account: account}]};
      let doc = {$set: {password: password, modify_time: Date.now()}};
      _update(conditions, doc).then(raw => {
        console.log(raw);
        if (raw.nModified > 0) {
          ret.code = 0;
          ret.msg = 'success';
          resolve(ret);
        } else {
          console.error('no user has modified');
          ret.code = 1;
          ret.msg = 'modify user failed';
          resolve(ret);
        }
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'modify user failed';
        resolve(ret);
      })
    }
  })
};

/* GET users listing. */

router.get('/add', function(req, res) {
  addUser(req, defaultOptions.role_user).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  });
});

router.get('/addAdmin', function(req, res) {
  addUser(req, defaultOptions.role_admin).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  });
});

router.get('/delete', function (req, res) {
  deleteUserById(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

router.post('/deleteBatch', function (req, res) {
  deleteUsers(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

router.get('/update', function (req, res) {
  updateUser(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

router.get('/check', function(req, res) {
  checkAccountAndPwd(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  });
});

router.get('/all', function(req, res) {
  findAllUser().then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

router.get('/allByRole', function(req, res) {
  findAllByRole(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify(defaultOptions.code4));
    }
  })
});

module.exports = router;
