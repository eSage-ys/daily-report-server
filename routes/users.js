const express = require('express');
const router = express.Router();
const User = require('../common/mongodb').User;
const mongoose = require('mongoose');

// todo model api
// todo all tips
/**
 * _remove
 * package User.remove <return Query> to Promise
 *
 * @param conditions
 */
const _remove = function (conditions) {
  return new Promise((resolve, reject) => {
    User.remove(conditions, (err, status) => {
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
 * package User.findByIdAndRemove <return Query> to Promise
 *
 * @param id
 * @param option
 */
const _findByIdAndRemove = function (id, option = null) {
  return new Promise((resolve, reject) => {
    User.findByIdAndRemove(id, option, (err) => {
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
 * package User.update <return Query> to Promise
 *
 * @param conditions
 * @param doc
 * @param option
 */
const _update = function (conditions, doc, option = {}) {
  return new Promise((resolve, reject) => {
    User.update(conditions, doc, option, (err, raw) => {
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
 * package User.find <return Query> to Promise
 *
 * @param option
 */
const _find = function (conditions = {}, projection = {account: 1, _id: 1, role: 1}, option = null) {
  return new Promise(function (resolve, reject) {
    User.find(conditions, projection, option, function (err, docs) {
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
    let account = req.query.account;
    let password = req.query.password;
    // todo 参数校验
    if (!account || !password) {
      ret.code = 2;
      ret.msg = 'params error';
      resolve(ret);
    } else {
      // todo 1
      // 判断帐号是否存在
      _find({account: account}).then(function (user) {
        if (user.length > 0) {
          ret.code = 3;
          ret.msg = 'account already exist';
          resolve(ret);
        } else {
          User.save({account: account, password: password, role: role, _id: new mongoose.Types.ObjectId()}).then(function (docs) {
            console.log(docs);
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
 *
 * @param req
 */
const findAllByRole = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let role = req.query.role;
    // todo [0,1]
    if (!role || [0,1].indexOf(Number(role)) === -1) {
      ret.code = 2;
      ret.msg = 'params error';
      resolve(ret);
    } else {
      _find({role: role}).then(function (docs) {
        ret.code = 0;
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
const checkAccountAndPwd = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let account = req.query.account;
    let password = req.query.password;
    if (!account || !password) {
      ret.code = 2;
      ret.msg = 'params error';
      resolve(ret);
    } else {
      _find({account: account, password: password}).then(function (doc) {
        ret.code = 0;
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
const findAllUser = function () {
  return new Promise(resolve => {
    let ret = {};
    _find().then(function (docs) {
      ret.code = 0;
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
const deleteUserById = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let id = req.query && req.query.id;
    if (!id) {
      ret.code = 2;
      ret.msg = 'params error';
      resolve(ret);
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
const deleteUsers = function (req) {
  return new Promise(resolve => {
    let ret = {};
    let idList = req.body.ids;
    if (!Array.isArray(idList)) {
      ret.code = 2;
      ret.msg = 'params error';
      resolve(ret);
    } else {
      _remove({_id: {$in: idList}}).then((status) => {
        ret.code = 0;
        ret.msg = 'success';
        if (status && status.n) {
          ret.count = status.n
        }
        resolve(ret);
      }).catch(err => {
        console.error(err);
        ret.code = 1;
        ret.msg = 'delete users failed';
        resolve(ret);
      })
    }
  })
};
// todo
const updateUser = function (req) {

};


/* GET users listing. */
router.get('/add', function(req, res) {
  // todo const
  let role = 1;
  addUser(req, role).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  });
});

router.get('/addAdmin', function(req, res) {
  // todo const
  let role = 0;
  addUser(req, role).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  });
});

router.get('/delete', function (req, res) {
  deleteUserById(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  })
});

router.post('/deleteBatch', function (req, res) {
  deleteUsers(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  })
});

router.get('/update', function (req, res) {

});

router.get('/check', function(req, res) {
  checkAccountAndPwd(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  });
});

router.get('/all', function(req, res) {
  findAllUser().then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  })
});

router.get('/allByRole', function(req, res) {
  findAllByRole(req).then(ret => {
    try {
      res.send(JSON.stringify(ret));
    } catch (e) {
      res.send(JSON.stringify({code: 4, msg: 'data error'}));
    }
  })
});

module.exports = router;
