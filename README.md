# Installation Instructions

## Backend

0. Clone the repository:   ```bash
   git clone https://github.com/Codinglone/tf-expense-tracker-backend.git   ```

1. Navigate to the backend directory:   ```bash
   cd tf-expense-tracker-backend   ```

2. Install dependencies:   ```bash
   npm install   ```

3. Create a `.env` file in the backend root directory and add the following:   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_jwt_secret_key   ```

4. Start the development server:   ```bash
   npm run dev   ```

The backend API will be available at `http://localhost:5000/api`

API documentation can be accessed at `http://localhost:5000/api-docs`