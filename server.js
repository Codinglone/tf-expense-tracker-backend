const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Taskforce Expense Tracker API",
      version: "1.0.0",
      description: "API documentation for Taskforce Expense Tracker",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const authRoutes = require("./routes/auth");
const incomeRoutes = require("./routes/income");
const expenseRoutes = require("./routes/expenses");
const categoryRoutes = require("./routes/categories");
const subcategoryRoutes = require("./routes/subcategories");
const accountRoutes = require('./routes/accounts');
const budgetRoutes = require('./routes/budgets');
const incomeCategoryRoutes = require('./routes/incomeCategories');

app.use("/api/auth", authRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/income-categories', incomeCategoryRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
