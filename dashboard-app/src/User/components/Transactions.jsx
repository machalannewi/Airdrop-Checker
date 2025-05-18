import React, { useEffect, useState } from 'react';
import "../../assets/General.css";

const TransactionList = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('https://server-4vul.onrender.com/api/deposits/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();
        setDeposits(data.deposits || []);
      } catch (err) {
        console.error('📛 Error fetching deposits:', err);
        setDeposits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400">Loading deposits...</p>;
  }

  if (deposits.length === 0) {
    return <p className="text-center text-gray-500">No deposits yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {deposits.map((deposit) => (
        <div
          key={deposit._id}
          className="bg-white dark:bg-gray-800 shadow rounded-xl p-4 border border-gray-200 dark:border-gray-700"
        >
          <p className="font-semibold text-gray-800 dark:text-gray-300">
            <strong>Amount:</strong> ${deposit.amount}
          </p>
          <p className="font-semibold text-gray-600 dark:text-gray-300">
            <strong>Currency:</strong> {deposit.paymentMethod}
          </p>
          <p className="font-semibold text-gray-600 dark:text-gray-300">
            <strong>Status:</strong>{' '}
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                deposit.status === 'verified'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {deposit.status}
            </span>
          </p>
          <p className="font-semibold text-sm text-gray-600 dark:text-gray-300">
            <strong>Date:</strong>{' '}
            {new Date(deposit.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
