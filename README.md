<div align="center">
  <h3 align="center">Xpense</h3>

  <div align="center">
    Xpense is a comprehensive expense tracker application that helps users manage their finances effectively. With a modern, responsive design and powerful features, users can track their income and expenses, set budgets, and gain insights into their spending patterns. The application supports Gmail authentication and provides real-time budget notifications to help users stay on top of their finances.
  </div>
</div>

## Features

### Core Features
- **User Authentication**: Secure login using Gmail
- **Transaction Management**:
  - Add, edit, and delete transactions
  - Categorize transactions (income/expense)
  - Detailed transaction history with timestamps
  - Filter transactions by time period (week/month/year/all)

### Dashboard
- **Financial Overview**:
  - Total balance with trend indicators
  - Total income and expenses
  - Percentage breakdown of income vs expenses
  - Recent transactions list

### Analytics
- **Visual Insights**:
  - Income & Expenses area chart
  - Expense categories pie chart
  - Monthly spending bar chart
  - Spending insights (highest expense, highest income, savings rate)

### Smart Budgeting
- **Budget Management**:
  - Set monthly budgets for different categories
  - Real-time budget monitoring
  - Smart notifications for:
    - Budget exceeded (error notification)
    - Budget nearing limit (warning notification)
  - Category-wise budget tracking

### User Experience
- **Modern UI/UX**:
  - Responsive design for desktop and mobile
  - Dark/Light theme support
  - Interactive charts and graphs
  - Toast notifications for actions
  - Smooth animations and transitions

## Tech Stack

### Frontend
- **Framework**: React.js
- **Styling**: 
  - Tailwind CSS
  - Shadcn UI components
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Notifications**: react-toastify

### Backend
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Real-time Updates**: Firebase Realtime Database

## Getting Started

### Prerequisites
- Node.js and npm installed
- Firebase project setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Xpense.git
   cd Xpense
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
