import Sale from "../models/Sale.js";
import mongoose from "mongoose";

/**
 * @desc Get full sales summary with optional date filtering
 * @route GET /api/sales/summary
 * @access Private (Admin)
 */
export const getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 🗓️ Build a date filter if provided
    const match = {};
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include entire end day
        match.date.$lte = end;
      }
    }

    // 🧮 Get all filtered sales
    const sales = await Sale.find(match);

    // 💰 Total Revenue & Order Count
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalOrders = sales.length;

    // 📅 Daily breakdown for charts
    const dailySales = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 🏆 Top 5 best-selling products
    const topProducts = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalRevenue,
      totalOrders,
      dailySales,
      topProducts,
      filtered: !!(startDate || endDate),
    });
  } catch (err) {
    console.error("Error fetching sales summary:", err);
    res.status(500).json({ error: "Failed to fetch sales summary" });
  }
};

/**
 * @desc Get all individual sales (for detailed admin view)
 * @route GET /api/sales
 * @access Private (Admin)
 */
export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("user", "name email")
      .populate("order", "_id totalAmount date");
    res.json(sales);
  } catch (err) {
    console.error("Error fetching all sales:", err);
    res.status(500).json({ error: "Failed to fetch all sales" });
  }
};

/**
 * @desc Get a single sale by ID
 * @route GET /api/sales/:id
 * @access Private (Admin)
 */
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("user", "name email")
      .populate("order");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.json(sale);
  } catch (err) {
    console.error("Error fetching sale:", err);
    res.status(500).json({ error: "Failed to fetch sale" });
  }
};
