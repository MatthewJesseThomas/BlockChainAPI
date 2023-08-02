const conDB = require('../config/index.js');
const { hash, compare, hashSync } = require('bcrypt');
const { createToken } = require('../middleware/AuthenticatedUser.js');

class User {cls
  
    login(req, res) {
        const { emailAddress, user_password } = req.body;
        const Qry = `SELECT user_id, firstName, lastName, gender, cellphoneNumber, emailAddress, user_password 
        FROM Users
        WHERE emailAddress = '${emailAddress}';`;
        conDB.query(Qry, async (err, data) => {
            if (err) {
              throw err;
            }
            console.log(err);
            if ((!data.length) || (data == null)) {
                res.status(401).json({
                    err:
                        "You've Provided an Invalid Email Address"
                });
            } else {
                await compare(user_password, data[0].user_password, (cErr, cResult) => {
                    if (cErr) {
                      throw cErr;
                    }
                    console.log(cErr);
                    const jwToken =
                        createToken(
                            {
                                emailAdd, user_password
                            }
                        );
                    res.cookie('LegitUser!!!', jwToken, {
                        maxAge: 3600000,
                        httpOnly: true
                    })
                    if (cResult) {
                        res.status(200).json({
                            msg: 'Logged In!!!',
                            jwToken,
                            result: data[0]
                        })
                    } else {
                        res.status(401).json({
                            err: 'You Have Entered an Invalid Password or Have Not Registered Yet!!!'
                        })
                    }
                })
            }
        });
    }
    fetchUsers(req, res) {
        const Qry =
            `SELECT user_id, firstName, lastName, gender, cellphoneNumber, emailAddress, user_password
        FROM Users;`;
        conDB.query(Qry, (err, data) => {
            console.log(err);
            if (err) {
              throw err;
            } else {
              res.status(200).json(
                       { results: data }
                   );
            }
        });
    }
    fetchUser(req, res) {
        const Qry =
            `SELECT user_id, firstName, lastName, gender, cellphoneNumber, emailAddress, user_password
        FROM Users
        WHERE user_id = ?;
        `;
        conDB.query(Qry, [req.params.id], (err, data) => {
            console.log(err);
            if (err) {
              throw err;
            } else {
              res.status(200).json(
                       { results: data }
                   );
            }
        })
    }
    async createUser(req, res) {
        let userDetails = req.body;
        userDetails.user_password = await
            hash(userDetails.user_password, 15);
        let user = {
            emailAddress: userDetails.emailAddress,
            user_password: userDetails.user_password
        }
        const Qry =
            `INSERT INTO Users
        SET ?;`;
        conDB.query(Qry, [userDetails], (err) => {
            if (err) {
                res.status(401).json({ err });
                console.log(err);
            } else {
                const jwToken = createToken(user);
                res.cookie("LegitUser...", jwToken, {
                    maxAge: 3600000,
                    httpOnly: true
                });
                res.status(200).json({ msg: "A New User Record Was Created & Saved." })
            }
        });
    }
    updateUser(req, res) {
        let data = req.body;
        const Qry =
            `UPDATE Users SET ? WHERE user_id = ?;`;
        conDB.query(Qry, [data, req.params.id], (err) => {
            if (err) {
              console.log(err);
            } else {
              res.status(200).json({
                       msg: "A Row Was Affected, Success..."
                   });
            }
        })
    }
    deleteUser(req, res) {
        const Qry =
            `DELETE FROM Users WHERE user_id = ?;`;
        conDB.query(Qry, [req.params.id],
            (err) => {
                if (err) {
                  throw err;
                }
                console.log(err);
                res.status(200).json({
                    msg: "A User Record Was Removed From Crypto..."
                });
            });
    }
}
class Crypto {
    fetchCryptos(req, res) {
        const Qry = `SELECT * FROM Crypto;`;
        conDB.query(Qry, (err, results) => {
            if (err) {
              throw err;
            }
            console.log(err);
            res.status(200).json({ results: results })
        });
    }
    fetchCrypto(req, res) {
        const Qry = `SELECT * FROM Crypto WHERE crypto_id = ?;`;
        conDB.query(Qry, [req.params.id], (err, results) => {
            if (err) {
              throw err;
            }
            console.log(err);
            res.status(200).json({ results: results });
        });
    }
    addCrypto(req, res) {
        const Qry = `INSERT INTO Crypto SET ?;`;
        conDB.query(Qry, [req.body, req.params.id], (err) => {
            if (err) {
                res.status(400).json({
                    err:
                        "Unable to Insert Into a New Record..."
                });
                console.log(err);
            } else {
                res.status(200).json({
                    msg:
                        "Crypto Was Successfully Saved!!!"
                });
            }
        });
    }
    updateCrypto(req, res) {
        const Qry =
            `UPDATE Crypto SET ? WHERE crypto_id = ?;`;
        conDB.query(Qry, [req.body, req.params.id], (err) => {
            if (err) {
                console.log(err);
                res.status(400).json({ err });
            } else {
                res.status(200).json({
                    msg:
                        "Crypto Details Updated Successfully..."
                });
            }
        });
    }
    deleteCrypto(req, res) {
        const Qry = `DELETE FROM Crypto WHERE crypto_id = ?;`;
        conDB.query(Qry, [req.params.id], (err) => {
            if (err) {
              res.status(400).json({
                            err:
                                "This Record Cannot Be Found..."
                        });
            }
            console.log(err);
            res.status(200).json({
                msg:
                    "A Crypto Was Deleted Successfully..."
            })
        });
    }
}

module.exports = {
    User, 
    Crypto
}