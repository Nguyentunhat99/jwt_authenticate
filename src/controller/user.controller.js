let allAccess = (req, res) => {
  return res.status(200).send("Public Content.");
};

let userBoard = (req, res) => {
  return res.status(200).send("User Content.");
};

let adminBoard = (req, res) => {
  return res.status(200).send("Admin Content.");
};

let moderatorBoard = (req, res) => {
  return res.status(200).send("Moderator Content.");
};


module.exports = {
    allAccess,
    userBoard,
    adminBoard,
    moderatorBoard
} 
