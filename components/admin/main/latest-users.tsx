'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);
interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  balance: number;
  total_spent: number;
  totalOrders: number;
  servicesDiscount: number;
  specialPricing: boolean;
  status: 'active' | 'suspended' | 'banned';
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
}
interface LatestUsersProps {
  latestUsers: User[];
  latestUsersLoading: boolean;
  formatCurrency: (amount: number, currency: string) => string;
}

const LatestUsers = React.memo(function LatestUsers({
  latestUsers,
  latestUsersLoading,
  formatCurrency,
}: LatestUsersProps) {
  return (
    <div className="mb-6">
      <div className="card card-padding">
        <div className="card-header mb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="card-icon">
                <FaUsers />
              </div>
              <h3 className="card-title">Latest Users</h3>
            </div>
            <Link
              href="/admin/services"
              className={`btn btn-secondary flex items-center gap-2`}
            >
              <FaUsers className="w-4 h-4" />
              View All Users
            </Link>
          </div>
        </div>

        <div>
          {latestUsers.length === 0 ? (
            <div className="text-center py-12">
              <FaUsers
                className="h-16 w-16 mx-auto mb-4"
                style={{ color: 'var(--text-muted)' }}
              />
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                No users found
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {latestUsers.length === 0
                  ? 'No users exist yet.'
                  : 'No users match your criteria.'}
              </p>
            </div>
          ) : (
            <>
              {}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="sticky top-0 bg-white border-b z-10">
                    <tr>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        ID
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Username
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Email
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Balance
                      </th>
                      <th
                        className="text-left p-3 font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Registered Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-3">
                          <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {user.id || 'N/A'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {user.username || 'null'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {user.email || 'null'}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {user.emailVerified ? (
                              <>
                                <FaCheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">
                                  Verified
                                </span>
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">
                                  Unverified
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-left">
                            <div
                              className="font-semibold text-sm"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {formatCurrency(
                                user.balance || 0,
                                user.currency || 'USD'
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {user.createdAt
                                ? new Date(
                                    user.createdAt
                                  ).toLocaleDateString()
                                : 'null'}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {user.createdAt
                                ? new Date(
                                    user.createdAt
                                  ).toLocaleTimeString()
                                : 'null'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {}
              <div className="lg:hidden">
                <div className="space-y-4">
                  {latestUsers.map((user) => (
                    <div
                      key={user.id}
                      className="card card-padding border-l-4 border-blue-500 mb-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {user.id || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Username
                          </div>
                          <div
                            className="font-medium text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {user.username || 'null'}
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Email
                          </div>
                          <div
                            className="text-sm mb-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {user.email || 'null'}
                          </div>
                          <div className="flex items-center gap-1">
                            {user.emailVerified ? (
                              <>
                                <FaCheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">
                                  Verified
                                </span>
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">
                                  Unverified
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-xs font-medium mb-1"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            Balance
                          </div>
                          <div
                            className="font-semibold text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {formatCurrency(
                              user.balance || 0,
                              user.currency || 'USD'
                            )}
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Registered:{' '}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : 'null'}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Time:{' '}
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleTimeString()
                              : 'null'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default LatestUsers;