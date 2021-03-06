const i18n = require('../services/i18n');
const routeNames = require('../locales/routeNamesTR.json');
const { DB } = require('../services/sequelize');
const authentication = require('../utils/authentication');
const { getNullableInput, getCheckboxStatus } = require('../utils/formHelpers');

exports.listUserView = async (req, res) => {
  const userList = await DB.User.findAll({
    raw: true,
    include: [
      {
        model: DB.UserRole,
        attributes: ['role'],
      },
    ],
  });
  return res.render('layouts/main', {
    partialName: 'listUsers',
    userList,
  });
};

exports.addUserView = async (req, res) => {
  const userRole = await DB.UserRole.findAll({
    raw: true,
  });
  return res.render('layouts/main', {
    partialName: 'addUser',
    endPoint: 'add',
    userRole,
  });
};

exports.addUser = async (req, res) => {
  const user = req.body;
  const dbUser = await DB.User.findAll({
    where: {
      username: user.username,
    },
    raw: true,
  });
  if (dbUser.length !== 0) {
    req.session.flashMessages = {
      message: i18n.__('IN_USE', routeNames.USER),
      type: 'danger',
    };
    return res.redirect('/user/add');
  }
  try {
    const hashedPassword = await authentication.hashPassword(user.password);
    await DB.User.create({
      name: user.name,
      surname: user.surname,
      username: user.username,
      roleId: user.roleId,
      password: hashedPassword,
      email: user.email,
      phoneNumber: getNullableInput(user.phoneNumber),
      address: getNullableInput(user.address),
      isActive: getCheckboxStatus(user.isActive),
    });
    req.session.flashMessages = {
      message: i18n.__('ADDED', routeNames.USER),
      type: 'success',
    };
    return res.redirect('/user/add');
  } catch (error) {
    req.session.flashMessages = {
      message: i18n.__('ADD_ERROR', routeNames.USER),
      type: 'danger',
    };
    return res.redirect('/user/add');
  }
};

exports.updateUserView = async (req, res) => {
  const { id } = req.params;
  const userRole = await DB.UserRole.findAll({
    raw: true,
  });
  try {
    const user = await DB.User.findOne({
      where: { id },
      raw: true,
    });
    if (!user) {
      return res.redirect('/user/list');
    }
    return res.render('layouts/main', {
      partialName: 'addUser',
      endPoint: 'update',
      userRole,
      user,
    });
  } catch (error) {
    return res.redirect('/user/list');
  }
};

exports.updateUser = async (req, res) => {
  const user = req.body;
  try {
    const updatedUserObject = await createUserObject(user);
    await DB.User.update(updatedUserObject,
      {
        where: {
          id: user.id,
        },
        raw: true,
      });
    req.session.flashMessages = {
      message: i18n.__('UPDATED', routeNames.USER),
      type: 'success',
    };
    return res.redirect(`/user/update/${user.id}`);
  } catch (error) {
    req.session.flashMessages = {
      message: i18n.__('UPDATE_ERROR', routeNames.USER),
      type: 'danger',
    };
    return res.redirect(`/user/update/${user.id}`);
  }
};

const createUserObject = async (user) => {
  const updatedUser = {
    name: user.name,
    surname: user.surname,
    roleId: user.roleId,
    email: user.email,
    phoneNumber: getNullableInput(user.phoneNumber),
    address: getNullableInput(user.address),
    isActive: getCheckboxStatus(user.isActive),
  };
  if (getCheckboxStatus(user.isPasswordActive)) {
    updatedUser.password = await authentication.hashPassword(user.password);
  }
  return updatedUser;
};
