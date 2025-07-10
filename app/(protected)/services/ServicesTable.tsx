'use client';

import { PriceDisplay } from '@/components/PriceDisplay';
import { formatNumber } from '@/lib/utils';
import { Fragment } from 'react';
import { FaEye, FaRegStar, FaStar } from 'react-icons/fa';

interface Service {
  id: number;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  avg_time: string;
  description: string;
  category: {
    category_name: string;
    id: number;
  };
  isFavorite?: boolean;
}

interface ServicesTableProps {
  groupedServices: Record<string, Service[]>;
  toggleFavorite: (serviceId: number) => void;
  handleViewDetails: (service: Service) => void;
}

export default function ServicesTable({
  groupedServices,
  toggleFavorite,
  handleViewDetails,
}: ServicesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white first:rounded-tl-lg">
              Fav
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
              ID
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
              Service
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
              Rate per 1000
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
              Min order
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
              Max order
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
              Average time
            </th>
            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white last:rounded-tr-lg">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedServices).map(
            ([categoryName, categoryServices]) => (
              <Fragment key={categoryName}>
                {/* Category Row */}
                <tr>
                  <td colSpan={8} className="py-0">
                    <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-medium py-3 px-6 shadow-lg">
                      <h3 className="text-lg font-semibold">{categoryName}</h3>
                    </div>
                  </td>
                </tr>

                {/* Category Services */}
                {categoryServices.map((service, index) => {
                  const isLastInCategory =
                    index === categoryServices.length - 1;
                  const isLastCategory =
                    Object.keys(groupedServices).indexOf(categoryName) ===
                    Object.keys(groupedServices).length - 1;
                  const isLastRow = isLastInCategory && isLastCategory;

                  return (
                    <tr
                      key={service.id}
                      className={`border-b border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30 ${
                        isLastRow ? 'last:border-b-0' : ''
                      }`}
                    >
                      <td
                        className={`py-3 px-4 ${
                          isLastRow ? 'first:rounded-bl-lg' : ''
                        }`}
                      >
                        <button
                          onClick={() => toggleFavorite(service.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                          title={
                            service.isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                        >
                          {service.isFavorite ? (
                            <FaStar className="w-4 h-4 text-yellow-500" />
                          ) : (
                            <FaRegStar className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                          {service.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {service.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          <PriceDisplay
                            amount={service.rate}
                            originalCurrency={'USD'}
                          />
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatNumber(service.min_order || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatNumber(service.max_order || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {service.avg_time || 'N/A'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          isLastRow ? 'last:rounded-br-lg' : ''
                        }`}
                      >
                        <button
                          onClick={() => handleViewDetails(service)}
                          className="flex items-center gap-2 px-3 py-1 text-sm text-[var(--primary)] dark:text-[var(--secondary)] hover:text-[#4F0FD8] dark:hover:text-[#A121E8] border border-[var(--primary)] dark:border-[var(--secondary)] rounded hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--secondary)]/10 transition-colors duration-200"
                        >
                          <FaEye className="w-3 h-3" />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
