# Installation Instructions

## Backend Setup

Follow the steps below to set up and run the backend server for the Expense Tracker application:

### Step 1: Clone the Repository
Clone the repository from GitHub to your local machine:
```bash
git clone https://github.com/Codinglone/tf-expense-tracker-backend.git
```

### Step 2: Navigate to the Backend Directory
Change to the backend directory:
```bash
cd tf-expense-tracker-backend
```

### Step 3: Install Dependencies
Install all required dependencies using npm:
```bash
npm install
```

### Step 4: Configure Environment Variables
Create a `.env` file in the root of the backend directory and add the following environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_jwt_secret_key
```
- Replace `your_jwt_secret_key` with a strong, secure key for JWT authentication.

### Step 5: Start the Development Server
Run the following command to start the backend server in development mode:
```bash
npm run dev
```

### Backend API
- The backend API will be available at: `http://localhost:5000/api`
- API documentation is accessible at: `http://localhost:5000/api-docs`

For additional details or troubleshooting, refer to the project documentation or contact the development team.
