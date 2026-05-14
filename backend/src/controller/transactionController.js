import { Transaction } from "../model/transaction.js";

export const createTransactions = async (req, res) => {
  try {
    const { student, course, amount, method } = req.body;
    const transaction = await Transaction.create({
      student,
      course,
      amount,
      method,
    });

    return res
      .status(201)
      .json({ message: "Transaction successful", transaction });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transaction = await Transaction.find().populate("student course");

    return res
      .status(200)
      .json({ message: "Transactions fetched", transaction });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transaction = await Transaction.find({ student: userId }).populate(
      "course"
    );

    return res.status(200).json({
      message: "Transaction of the student fetched successfully",
      transaction,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!transaction)
      return res.status(404).json({ message: "Transaction  not found" });

    return res
      .status(200)
      .json({ message: "Transaction updated successfully", transaction });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating transaction", error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting transaction", error: error.message });
  }
};
