const removed = (res) =>
  res.status(410).json({
    message: "Transactions were removed for the gamified learning model",
  });

export const createTransactions = async (req, res) => removed(res);
export const getAllTransactions = async (req, res) => removed(res);
export const getUserTransactions = async (req, res) => removed(res);
export const updateTransaction = async (req, res) => removed(res);
export const deleteTransaction = async (req, res) => removed(res);
