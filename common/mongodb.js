/**
 * Created with JetBrains WebStorm.
 * User: eSage
 * Date: 18-4-7
 * Time: 下午2:17
 * Description:
 */
const config = require('./config');
const mongoose = require('mongoose');
mongoose.connect(config.mongoDbUrl);
const db = mongoose.connection;

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
/**
 * 任务集合
 * id： id
 * parent_id: 父级id
 * user_id: 用户id
 * title: 任务标题
 * detail: 任务详情
 * type: 任务类型 [0: 待办事项/1: 明日计划/2: 当前任务]
 * progress: 任务进度
 * expect_cost: 预计耗时（h）
 * real_cost: 实际耗时（h）
 * daily_cost: 每日耗时（h）
 * priority: 任务优先级 默认5 越小优先级越高 最高为1
 * status: 任务状态 [0：进行中/1：完成/2：删除]
 * hierarchies: 任务层级结构（根任务）[节点层级，默认1级，依次增加]
 * start_time: 任务开始时间
 * end_time: 任务结束时间
 */
const taskSchema = new Schema({
    _id: {type: ObjectId},
    // children_id: [{type: ObjectId, ref: 'tasks' , default: ''}],
    parent_id: {type: String, default: ''},
    user_id: {type: ObjectId, ref: 'user'},
    title: {type: String},
    detail: {type: String, default: ''},
    type: {type: Number, default: 0},
    progress: {type: Number, default: 0},
    expect_cost: {type: String},
    real_cost: {type: String},
    daily_cost: {type: Object},
    priority: {type: Number, default: 5},
    status: {type: Number, default: 0},
    hierarchies: {type: Number, default: 1},
    start_time: {type: Date},
    end_time: {type: Date},
    create_time: {type: Date, default: Date.now},
    creator: {type: String, default: 0},
    modify_time: {type: Date, default: Date.now},
    modifier: {type: String, default: 0}
});
/**
 * 用户集合
 * id: id
 * account: 用户帐号
 * password: 用户密码
 * role: 用户角色 [0: admin/ 1: 普通用户]
 */
const userSchema = new Schema({
    _id: {type: ObjectId},
    account: {type: String},
    password: {type: String},
    role: {type: Number},
    create_time: {type: Date, default: Date.now},
    creator: {type: String, default: 0},
    modify_time: {type: Date, default: Date.now},
    modifier: {type: String, default: 0}
});
/**
 * 操作日志集合
 * id: id
 * task_id: 任务id
 * action: 操作类型 [新增/更新/删除]
 * detail: 详细操作 [更新进度/更新所属关系/更新状态...]
 */
const actionLogSchema = new Schema({
    _id: {type: ObjectId},
    task_id: {type: ObjectId, ref: 'task'},
    action: {type: String},
    detail: {type: String},
    create_time: {type: Date, default: Date.now},
    creator: {type: String, default: 0},
    modify_time: {type: Date, default: Date.now},
    modifier: {type: String, default: 0}
});

const taskModel = db.model('task', taskSchema);
const userModel = db.model('user', userSchema);
const actionLogModel = db.model('actionLog', actionLogSchema);
db.on('error', function(err) {
    console.log('数据库test连接失败：' + err);
});

db.on('open', function () {
   console.log('数据库连接成功');
});

module.exports = {
    Task: taskModel,
    User: userModel,
    ActionLog: actionLogModel
};
// insert method1
// const test = new userModel({
//     _id: new mongoose.Types.ObjectId(),
//     account: 'admin',
//     password: '123456',
//     role: 0
// });
// test.save(function (err, doc) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(doc);
//     }
// });
// insert method2
// userModel.create([{
//     _id: new mongoose.Types.ObjectId(),
//     account: 'admin3',
//     password: '123456',
//     role: 0
// },{
//     _id: new mongoose.Types.ObjectId(),
//     account: 'admin4',
//     password: '123456',
//     role: 0
// }], function (err, docs) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(docs);
//     }
// });
// find
// userModel.find(function (err, docs) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(docs);
//     }
// });
// userModel.find({$or: [{account: {$in: ['admin', 'admin2']}}, {_id: '5ac8f6b8e2fe0e2df4a99a75'}]}, {account: 1, password: 1, role: 1}, {limit: 2}, function (err, docs) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log(docs);
//     }
// });