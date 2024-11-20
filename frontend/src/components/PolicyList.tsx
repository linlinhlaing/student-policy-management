import React, { useEffect, useState } from 'react';
import { isLogin } from '../utils/authUtils';
import useAuth from '../hooks/useAuth';

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

export interface YearPolicy {
  academic_year: string;
  policies: Policy[];
}

interface PolicyListProps {
  policies: YearPolicy[];
}

interface Votes {
  upvotes: number;
  downvotes: number;
}

export const PolicyList: React.FC<PolicyListProps> = ({ policies }) => {
  const [votes, setVotes] = useState<{ [key: string]: Votes }>({});
  const isLoggedIn = useAuth();

  useEffect(() => {
    const fetchVotes = async (policyId: string) => {
      try {
        const response = await fetch(`http://localhost:3000/policies/${policyId}/votes`);
        const data = await response.json();
        if (data.success) {
          setVotes((prevVotes) => ({
            ...prevVotes,
            [policyId]: { upvotes: data.upvotes, downvotes: data.downvotes },
          }));
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    policies.forEach((yearPolicy) => {
      yearPolicy.policies.forEach((policy) => {
        fetchVotes(policy.id);
      });
    });

  }, [policies]);

  const handleUpvote = async (policyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/policies/${policyId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setVotes((prevVotes) => ({
          ...prevVotes,
          [policyId]: {
            ...prevVotes[policyId],
            upvotes: (prevVotes[policyId]?.upvotes || 0) + 1
          }
        }));
      } else if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const handleDownvote = async (policyId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3000/policies/${policyId}/downvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setVotes((prevVotes) => ({
          ...prevVotes,
          [policyId]: {
            ...prevVotes[policyId],
            downvotes: (prevVotes[policyId]?.downvotes || 0) + 1
          }
        }));
      } else if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error downvoting:', error);
    }
  };

  return (
    <div className="policy-list p-4 space-y-4">
      {policies.map((yearPolicy) => (
        <div key={yearPolicy.academic_year} className="year-policy bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Year: {yearPolicy.academic_year}</h2>
          <div className="space-y-2">
            {yearPolicy.policies.map((policy) => (
              <div key={policy.id} className="policy-item bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{policy.title}</h3>
                  <p className="text-gray-600">{policy.description}</p>
                </div>
                <div className="votes flex space-x-4">
                  <div className="upvotes text-green-500">
                    <span className="font-bold">{votes[policy.id]?.upvotes || 0}</span> Upvotes
                  </div>
                  <div className="downvotes text-red-500">
                    <span className="font-bold">{votes[policy.id]?.downvotes || 0}</span> Downvotes
                  </div>
                  {isLoggedIn && (
                    <div className="vote-buttons flex space-x-2">
                      <button
                        className="thumb-up bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleUpvote(policy.id)}
                      >
                        👍
                      </button>
                      <button
                        className="thumb-down bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                        onClick={() => handleDownvote(policy.id)}
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}