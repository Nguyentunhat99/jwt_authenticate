let allAccess = (req, res) => {
  return res.status(200).send("Public Content (^_^).");
};

let userBoard = (req, res) => {
  return res.status(200).send("User Content (^_^).");
};

let adminBoard = (req, res) => {
  return res.status(200).send("Admin Content (^_^).");
};

let moderatorBoard = (req, res) => {
  return res.status(200).send("Moderator Content (^_^).");
};


module.exports = {
    allAccess,
    userBoard,
    adminBoard,
    moderatorBoard
} 
