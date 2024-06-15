<div>
  <img src="https://github.com/Devemmy01/Xpense/assets/87545460/ebd78638-4997-488a-885b-cf5117d9d58c" alt="logo" style="width: 200px; height: 120px;">
</div>

<div align="center">
  <br />
      <img src="https://github.com/Devemmy01/Xpense/assets/87545460/5ddd9012-afce-4731-9625-185bc2681bfe" alt="Project Banner">
      <img src="https://github.com/Devemmy01/Xpense/assets/87545460/17d8087d-aaec-479e-849a-cd54a800887c" alt="Project Banner">

  <br />

  <h3 align="center">Xpense</h3>

   <div align="center">
     Xpense is an expense tracker application that allows users to manage their transactions effectively. Users can log in with their Gmail accounts, add and view transactions, and see their income, expenses, and balance. Each transaction is timestamped with the date and time it was added.
  </div>
</div>

## Features

- **User Authentication**: Log in using Gmail.
- **Add Transactions**: Add details of income and expenses.
- **View Transactions**: View a list of all transactions with timestamps.
- **Financial Summary**: See the total income, total expenses, and current balance.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Shadcn UI
- **Backend**: Firebase (Authentication and Firestore Database)

## Getting Started

### Prerequisites

- Node.js and npm installed
- Firebase project setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Xpense.git
   cd Xpense.git

2. Install dependencies:
   ```bash
   npm install

3. Configure Firebase:
    Create a .env file in the root directory.
    Add your Firebase configuration:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id

4. Start the development server:
   ```bash
   npm run dev
