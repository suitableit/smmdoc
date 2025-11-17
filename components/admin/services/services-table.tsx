'use client';
import React, { Fragment } from 'react';
import {
  FaBriefcase,
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaEdit,
  FaEllipsisH,
  FaGripVertical,
  FaShieldAlt,
  FaTimesCircle,
  FaToggleOff,
  FaToggleOn,
  FaTrash,
  FaCheckCircle,
} from 'react-icons/fa';
import { PriceDisplay } from '@/components/PriceDisplay';
import { formatID } from '@/lib/utils';

const GradientSpinner = ({ size = 'w-16 h-16', className = '' }) => (
  <div className={`${size} ${className} relative`}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
      <div className="absolute inset-1 rounded-full bg-white"></div>
    </div>
  </div>
);

const ServiceActionsDropdown = React.memo(({
  service,
  statusFilter,
  categoryName,
  activeCategoryToggles,
  onEdit,
  onToggleStatus,
  onRestore,
  onDelete,
}: {
  service: any;
  statusFilter: string;
  categoryName: string;
  activeCategoryToggles: Record<string, boolean>;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="btn btn-secondary p-2 hover:bg-gray-100"
        title="Actions"
      >
        <FaEllipsisH className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              {statusFilter !== 'trash' && (
                <button
                  onClick={() => handleAction(onToggleStatus)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {service.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              )}
              {statusFilter === 'trash' && (
                <button
                  onClick={() => handleAction(onRestore)}
                  className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                >
                  Restore
                </button>
              )}
              <button
                onClick={() => handleAction(onEdit)}
                className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleAction(onDelete)}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                {statusFilter === 'trash' ? 'Delete Permanently' : 'Delete'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

ServiceActionsDropdown.displayName = 'ServiceActionsDropdown';

const getStatusIcon = (status: string, deletedAt?: string | null) => {
  if (deletedAt) {
    return <FaTrash className="h-3 w-3 text-red-500" />;
  }
  if (status === 'inactive') {
    return <FaTimesCircle className="h-3 w-3 text-red-500" />;
  }
  return <FaCheckCircle className="h-3 w-3 text-green-500" />;
};

const getActualCategoryName = (displayCategoryName: string) => {
  return displayCategoryName.includes(' (ID: ')
    ? displayCategoryName.split(' (ID: ')[0]
    : displayCategoryName;
};

interface ServicesTableProps {
  groupedServices: Record<string, any[]>;
  statusFilter: string;
  categoriesData: any;
  selectedServices: string[];
  selectedCategories: string[];
  collapsedCategories: string[];
  allCategoriesCollapsed: boolean;
  activeCategoryToggles: Record<string, boolean>;
  isUpdating: boolean;
  draggedCategory: string | null;
  dropTargetCategory: string | null;
  dropPosition: 'before' | 'after' | null;
  draggedService: string | null;
  dropTargetService: string | null;
  dropPositionService: 'before' | 'after' | null;
  getProviderNameById: (providerId: number | string | null, providerName?: string) => string;
  handleSelectAll: () => void;
  handleSelectCategory: (categoryName: string, services: any[]) => void;
  handleCategoryCheckboxChange: (categoryName: string) => void;
  handleSelectService: (serviceId: string) => void;
  toggleCategory: (categoryName: string) => void;
  toggleAllCategories: () => void;
  toggleCategoryAndServices: (categoryName: string, services: any[]) => void;
  handleEditService: (serviceId: number) => void;
  toggleServiceStatus: (service: any) => void;
  restoreService: (service: any) => void;
  deleteService: (id: string) => void;
  toggleRefill: (service: any) => void;
  toggleCancel: (service: any) => void;
  editCategory: (categoryName: string, categoryId: string) => void;
  handleOpenDeleteCategoryModal: (categoryName: string, categoryId: string | number, servicesCount: number) => void;
  handleDragStart: (e: React.DragEvent, categoryName: string) => void;
  handleDragOver: (e: React.DragEvent, targetCategoryName: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetCategoryName: string) => void;
  handleServiceDragStart: (e: React.DragEvent, serviceId: string) => void;
  handleServiceDragOver: (e: React.DragEvent, serviceId: string) => void;
  handleServiceDragLeave: (e: React.DragEvent) => void;
  handleServiceDragEnd: (e: React.DragEvent) => void;
  handleServiceDrop: (e: React.DragEvent, serviceId: string, categoryName: string) => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  groupedServices,
  statusFilter,
  categoriesData,
  selectedServices,
  selectedCategories,
  collapsedCategories,
  allCategoriesCollapsed,
  activeCategoryToggles,
  isUpdating,
  draggedCategory,
  dropTargetCategory,
  dropPosition,
  draggedService,
  dropTargetService,
  dropPositionService,
  getProviderNameById,
  handleSelectAll,
  handleSelectCategory,
  handleCategoryCheckboxChange,
  handleSelectService,
  toggleCategory,
  toggleAllCategories,
  toggleCategoryAndServices,
  handleEditService,
  toggleServiceStatus,
  restoreService,
  deleteService,
  toggleRefill,
  toggleCancel,
  editCategory,
  handleOpenDeleteCategoryModal,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDragEnd,
  handleDrop,
  handleServiceDragStart,
  handleServiceDragOver,
  handleServiceDragLeave,
  handleServiceDragEnd,
  handleServiceDrop,
}) => {
  return (
    <div className="lg:block">
      <table className="w-full text-sm min-w-[1200px]">
        <thead className="sticky top-0 bg-white border-b z-10">
          <tr>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  Object.values(groupedServices).flat().length > 0 &&
                  selectedServices.length === Object.values(groupedServices).flat().length &&
                  selectedCategories.length === Object.keys(groupedServices).length
                }
                className="rounded border-gray-300 w-4 h-4"
              />
            </th>
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
              Service
            </th>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Type
            </th>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Provider
            </th>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Price
            </th>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Min/Max
            </th>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Refill
            </th>
            <th
              className="text-left p-3 font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Cancel
            </th>
            {statusFilter !== 'trash' && (
              <th
                className="text-left p-3 font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Status
              </th>
            )}
            <th
              className="text-left p-3 font-semibold relative"
              style={{ color: 'var(--text-primary)' }}
            >
              Actions
              <button
                onClick={toggleAllCategories}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                title={
                  allCategoriesCollapsed
                    ? 'Expand all categories'
                    : 'Collapse all categories'
                }
              >
                {allCategoriesCollapsed ? (
                  <FaChevronDown className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                ) : (
                  <FaChevronUp className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                )}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(groupedServices) as [string, any[]][])
            .filter(([categoryName, services]) => {



              if (statusFilter === 'inactive') {
                const actualCategoryName = getActualCategoryName(categoryName);
                const categoryData = categoriesData?.data?.find(
                  (cat: any) => cat.category_name === actualCategoryName
                );

                const isCategoryInactive = !activeCategoryToggles[categoryName];

                const hasInactiveServices = services.some((service: any) => service.status === 'inactive');

                return isCategoryInactive || hasInactiveServices;
              }

              return true;
            })
            .sort(([categoryNameA], [categoryNameB]) => {

              const actualCategoryNameA =
                getActualCategoryName(categoryNameA);
              const actualCategoryNameB =
                getActualCategoryName(categoryNameB);

              const categoryA = categoriesData?.data?.find(
                (cat: any) =>
                  cat.category_name === actualCategoryNameA
              );
              const categoryB = categoriesData?.data?.find(
                (cat: any) =>
                  cat.category_name === actualCategoryNameB
              );

              const positionA = categoryA?.position || 'bottom';
              const positionB = categoryB?.position || 'bottom';

              if (positionA === 'top' && positionB === 'bottom')
                return -1;
              if (positionA === 'bottom' && positionB === 'top')
                return 1;
              return categoryNameA.localeCompare(categoryNameB);
            })
            .map(([categoryName, services], categoryIndex) => (
              <Fragment key={categoryName}>
                {draggedCategory &&
                  draggedCategory !== categoryName && (
                    <tr
                      className={`transition-all duration-200 ${
                        dropTargetCategory === categoryName &&
                        dropPosition === 'before'
                          ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400'
                          : 'h-1'
                      }`}
                      onDragOver={(e) =>
                        handleDragOver(e, categoryName)
                      }
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, categoryName)}
                    >
                      <td colSpan={11}>
                        {dropTargetCategory === categoryName &&
                          dropPosition === 'before' && (
                            <div className="flex items-center justify-center h-6 text-blue-600 text-sm font-medium">
                              Drop here
                            </div>
                          )}
                      </td>
                    </tr>
                  )}
                <tr
                  className={`bg-gray-50 border-t-2 border-gray-200 ${
                    draggedCategory === categoryName
                      ? 'opacity-50'
                      : ''
                  } ${
                    !activeCategoryToggles[categoryName]
                      ? 'bg-gray-300/90 border-l-4 border-l-gray-600'
                      : ''
                  }`}
                  onDragOver={(e) =>
                    handleDragOver(e, categoryName)
                  }
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, categoryName)}
                >
                  <td colSpan={11} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(categoryName)}
                          onChange={() => handleCategoryCheckboxChange(categoryName)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title={`Select ${categoryName} category`}
                        />
                        <div
                          className="cursor-grab hover:text-gray-600 transition-colors active:cursor-grabbing select-none"
                          title="Drag to reorder category"
                          draggable={true}
                          onDragStart={(e) =>
                            handleDragStart(e, categoryName)
                          }
                          onDragEnd={handleDragEnd}
                          style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                          }}
                        >
                          <FaGripVertical className="h-4 w-4 text-gray-400" />
                        </div>
                        <button
                          onClick={() =>
                            toggleCategory(categoryName)
                          }
                          className="flex items-center gap-2 hover:bg-gray-100 rounded p-1 transition-colors"
                        >
                          {collapsedCategories.includes(
                            categoryName
                          ) ? (
                            <FaChevronRight className="h-3 w-3" />
                          ) : (
                            <FaChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryAndServices(
                              categoryName,
                              services
                            );
                          }}
                          disabled={isUpdating}
                          className={`p-1 rounded transition-colors ${
                            activeCategoryToggles[categoryName]
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          } ${
                            isUpdating
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          title={`${
                            activeCategoryToggles[categoryName]
                              ? 'Deactivate'
                              : 'Activate'
                          } ${categoryName} category`}
                        >
                          {isUpdating ? (
                            <GradientSpinner size="w-4 h-4" />
                          ) : activeCategoryToggles[
                              categoryName
                            ] ? (
                            <FaToggleOn className="h-4 w-4" />
                          ) : (
                            <FaToggleOff className="h-4 w-4" />
                          )}
                        </button>

                        <span className="font-semibold text-md text-gray-800">
                          {categoryName}
                        </span>
                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                          {services.length} service
                          {services.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const actualCategoryName =
                              getActualCategoryName(categoryName);
                            const category =
                              categoriesData?.data?.find(
                                (cat: any) =>
                                  cat.category_name ===
                                  actualCategoryName
                              );
                            if (category) {
                              editCategory(
                                actualCategoryName,
                                category.id.toString()
                              );
                            }
                          }}
                          disabled={isUpdating}
                          className="p-1 hover:bg-blue-50 hover:text-blue-600 text-gray-400 rounded transition-colors disabled:opacity-50"
                          title={`Edit ${categoryName} category`}
                        >
                          <FaEdit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const actualCategoryName =
                              getActualCategoryName(categoryName);
                            const category =
                              categoriesData?.data?.find(
                                (cat: any) =>
                                  cat.category_name ===
                                  actualCategoryName
                              );
                            if (category) {
                              handleOpenDeleteCategoryModal(
                                actualCategoryName,
                                category.id,
                                services.length
                              );
                            }
                          }}
                          disabled={isUpdating}
                          className="p-1 hover:bg-red-50 hover:text-red-600 text-red-600 rounded transition-colors disabled:opacity-50"
                          title={`Delete ${categoryName} category`}
                        >
                          <FaTrash className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={services.every((service) =>
                            selectedServices.includes(service.id)
                          )}
                          onChange={() =>
                            handleSelectCategory(categoryName, services)
                          }
                          className="rounded border-gray-300 w-4 h-4"
                          title="Select all services in this category"
                        />
                        <span className="text-xs text-gray-500">
                          Select All
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
                {!collapsedCategories.includes(categoryName) &&
                  (services.length > 0 ? (
                    services.map((service: any, i: number) => (
                      <Fragment key={service.id}>
                        {draggedService &&
                          draggedService !== service.id && (
                            <tr
                              className={`transition-all duration-200 ${
                                dropTargetService === service.id &&
                                dropPositionService === 'before'
                                  ? 'h-2 bg-blue-100'
                                  : 'h-0'
                              }`}
                              onDragOver={(e) =>
                                handleServiceDragOver(e, service.id)
                              }
                              onDragLeave={handleServiceDragLeave}
                              onDrop={(e) =>
                                handleServiceDrop(
                                  e,
                                  service.id,
                                  categoryName
                                )
                              }
                            >
                              <td colSpan={11}>
                                {dropTargetService === service.id &&
                                  dropPositionService ===
                                    'before' && (
                                    <div className="h-1 bg-blue-400 rounded"></div>
                                  )}
                              </td>
                            </tr>
                          )}

                        <tr
                          className={`border-t hover:bg-gray-50 transition-all duration-200 animate-in fade-in slide-in-from-left-1 ${
                            draggedService === service.id
                              ? 'opacity-50'
                              : ''
                          } ${
                            service.status === 'inactive' && statusFilter !== 'trash'
                              ? 'bg-gray-200/70 border-l-4 border-l-gray-500'
                              : ''
                          }`}
                          style={{ animationDelay: `${i * 50}ms` }}
                          onDragOver={(e) =>
                            handleServiceDragOver(e, service.id)
                          }
                          onDragLeave={handleServiceDragLeave}
                          onDrop={(e) =>
                            handleServiceDrop(
                              e,
                              service.id,
                              categoryName
                            )
                          }
                        >
                          <td className="p-3 pl-8">
                            <div className="flex items-center gap-2">
                              <div
                                className="cursor-grab hover:text-gray-600 transition-colors active:cursor-grabbing select-none"
                                title="Drag to reorder service"
                                draggable={true}
                                onDragStart={(e) =>
                                  handleServiceDragStart(
                                    e,
                                    service.id
                                  )
                                }
                                onDragEnd={handleServiceDragEnd}
                                style={{
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                }}
                              >
                                <FaGripVertical className="h-3 w-3 text-gray-400" />
                              </div>
                              <input
                                type="checkbox"
                                checked={selectedServices.includes(
                                  service.id
                                )}
                                onChange={() =>
                                  handleSelectService(service.id)
                                }
                                className="rounded border-gray-300 w-4 h-4"
                              />
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {service.id
                                ? formatID(service.id)
                                : 'null'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="font-medium text-sm max-w-44"
                                style={{
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {service?.name || 'null'}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-800 w-fit">
                              {service?.serviceType?.name ||
                                'Standard'}
                            </div>
                          </td>
                          <td className="p-3">
                            <div
                              className="text-sm font-medium"
                              style={{
                                color: 'var(--text-primary)',
                              }}
                            >
                              {(() => {
                                try {
                                  const updateData =
                                    service?.updateText
                                      ? JSON.parse(
                                          service.updateText
                                        )
                                      : null;
                                  return (
                                    updateData?.provider || 'Self'
                                  );
                                } catch {
                                  return 'Self';
                                }
                              })()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-left">
                              <div
                                className="font-semibold text-sm"
                                style={{
                                  color: 'var(--text-primary)',
                                }}
                              >
                                <PriceDisplay
                                  amount={service?.rate}
                                  originalCurrency="USD"
                                />
                              </div>
                              <div
                                className="text-xs"
                                style={{
                                  color: 'var(--text-muted)',
                                }}
                              >
                                Cost:{' '}
                                <PriceDisplay
                                  amount={
                                    service?.providerPrice ||
                                    service?.provider_price ||
                                    service?.self_price ||
                                    service?.cost_price ||
                                    service?.rate
                                  }
                                  originalCurrency="USD"
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div
                                className="text-sm font-medium"
                                style={{
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {(
                                  service?.min_order || 0
                                ).toString()}{' '}
                                -{' '}
                                {(
                                  service?.max_order || 0
                                ).toString()}
                              </div>
                              <div
                                className="text-xs"
                                style={{
                                  color: 'var(--text-muted)',
                                }}
                              >
                                Min / Max
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <button
                                onClick={() =>
                                  toggleRefill(service)
                                }
                                className={`p-1 rounded transition-colors ${
                                  service.refill
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                title={
                                  service.refill
                                    ? 'Disable Refill'
                                    : 'Enable Refill'
                                }
                              >
                                {service.refill ? (
                                  <FaToggleOn className="h-5 w-5" />
                                ) : (
                                  <FaToggleOff className="h-5 w-5" />
                                )}
                              </button>
                              {service.refill && (
                                <div className="text-xs text-gray-600 space-y-1">
                                  {service.refillDays && (
                                    <div>
                                      {service.refillDays}D {service.refillDisplay}H
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => toggleCancel(service)}
                              className={`p-1 rounded transition-colors ${
                                service.cancel
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={
                                service.cancel
                                  ? 'Disable Cancel'
                                  : 'Enable Cancel'
                              }
                            >
                              {service.cancel ? (
                                <FaToggleOn className="h-5 w-5" />
                              ) : (
                                <FaToggleOff className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                          {statusFilter !== 'trash' && (
                            <td className="p-3">
                              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full w-fit">
                                {getStatusIcon(service.status, service.deletedAt)}
                                <span className="text-xs font-medium capitalize">
                                  {service.deletedAt ? 'trash' : (service.status || 'null')}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="p-3">
                            <div className="relative">
                              <ServiceActionsDropdown
                                service={service}
                                statusFilter={statusFilter}
                                categoryName={categoryName}
                                activeCategoryToggles={activeCategoryToggles}
                                onEdit={() => handleEditService(service.id)}
                                onToggleStatus={() => toggleServiceStatus(service)}
                                onRestore={() => restoreService(service)}
                                onDelete={() => deleteService(service?.id)}
                              />
                            </div>
                          </td>
                        </tr>
                        {draggedService &&
                          draggedService !== service.id && (
                            <tr
                              className={`transition-all duration-200 ${
                                dropTargetService === service.id &&
                                dropPositionService === 'after'
                                  ? 'h-2 bg-blue-100'
                                  : 'h-0'
                              }`}
                              onDragOver={(e) =>
                                handleServiceDragOver(e, service.id)
                              }
                              onDragLeave={handleServiceDragLeave}
                              onDrop={(e) =>
                                handleServiceDrop(
                                  e,
                                  service.id,
                                  categoryName
                                )
                              }
                            >
                              <td colSpan={11}>
                                {dropTargetService === service.id &&
                                  dropPositionService ===
                                    'after' && (
                                    <div className="h-1 bg-blue-400 rounded"></div>
                                  )}
                              </td>
                            </tr>
                          )}
                      </Fragment>
                    ))
                  ) : (
                    <tr className="border-t">
                      <td colSpan={11} className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <FaBriefcase className="h-8 w-8 mb-2 text-gray-400" />
                          <p className="text-sm font-medium">
                            No services in this category
                          </p>
                          <p className="text-xs">
                            Add services to populate this category
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                {draggedCategory &&
                  draggedCategory !== categoryName && (
                    <tr
                      className={`transition-all duration-200 ${
                        dropTargetCategory === categoryName &&
                        dropPosition === 'after'
                          ? 'h-8 bg-blue-100 border-2 border-dashed border-blue-400'
                          : 'h-1'
                      }`}
                      onDragOver={(e) =>
                        handleDragOver(e, categoryName)
                      }
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, categoryName)}
                    >
                      <td colSpan={11}>
                        {dropTargetCategory === categoryName &&
                          dropPosition === 'after' && (
                            <div className="flex items-center justify-center h-6 text-blue-600 text-sm font-medium">
                              Drop here
                            </div>
                          )}
                      </td>
                    </tr>
                  )}
              </Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
};
